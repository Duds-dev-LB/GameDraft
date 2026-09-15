import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type {
  Room,
  Player,
  DraftOption,
  Pick,
  ChatMessage,
  DraftSettings,
  AppPhase,
  PlayerSession,
  CustomOptionInput,
} from '@/types';
import { getGameService } from '@/services/game-service';
import { getCurrentPlayerIndex } from '@/utils/draft-engine';

interface GameActions {
  createRoom: (hostName: string, settings: DraftSettings) => Promise<Room>;
  joinRoom: (code: string, playerName: string) => Promise<void>;
  leaveRoom: () => void;
  startDraft: () => Promise<void>;
  makePick: (optionId: string) => Promise<void>;
  sendChatMessage: (message: string) => Promise<void>;
  kickPlayer: (playerId: string) => Promise<void>;
  updateSettings: (settings: DraftSettings) => Promise<void>;
  playAgain: () => Promise<void>;
  addCustomOptions: (options: CustomOptionInput[]) => Promise<void>;
  cleanup: () => void;
}

interface GameContextType {
  session: PlayerSession | null;
  room: Room | null;
  players: Player[];
  options: DraftOption[];
  picks: Pick[];
  messages: ChatMessage[];
  currentPlayer: Player | null;
  myPlayer: Player | null;
  isHost: boolean;
  phase: AppPhase;
  setPhase: React.Dispatch<React.SetStateAction<AppPhase>>;
  actions: GameActions;

  // Direct convenience methods
  startGame: () => Promise<void>;
  leaveRoom: () => void;
  makePick: (optionId: string) => Promise<void>;
  sendMessage: (msg: string) => Promise<void>;
  sendChatMessage: (msg: string) => Promise<void>;
  updateSettings: (settings: DraftSettings) => Promise<void>;
  restartGame: () => Promise<void>;
  playAgain: () => Promise<void>;
  kickPlayer: (playerId: string) => Promise<void>;
  setCustomOptions: (options: CustomOptionInput[]) => Promise<void>;

  // Convenience state object
  state: {
    room: Room | null;
    roomId: string;
    players: Player[];
    options: DraftOption[];
    picks: Pick[];
    messages: ChatMessage[];
    settings: DraftSettings;
    connected: boolean;
    myPlayer: Player | null;
    draftState: {
      currentTurn: { playerId: string; turnNumber: number };
      options: DraftOption[];
      picks: Pick[];
      timeRemaining: number;
    } | null;
  };
}

const SESSION_KEY = 'gamedraft_session';

const defaultSettings: DraftSettings = {
  category: 'football',
  mode: 'snake',
  maxPlayers: 4,
  timeLimit: 30,
  picksPerPlayer: 5,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const serviceRef = useRef(getGameService());

  const [session, setSession] = useState<PlayerSession | null>(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.playerId) return parsed;
      }
    } catch {
      // ignore
    }
    const newSession: PlayerSession = {
      playerId: crypto.randomUUID(),
      playerName: '',
      roomCode: null,
      roomId: null,
    };
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    } catch {
      // ignore
    }
    return newSession;
  });

  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [options, setOptions] = useState<DraftOption[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [phase, setPhase] = useState<AppPhase>('HOME');

  const unsubscribeRef = useRef<(() => void) | null>(null);

  const persistSession = useCallback((newSession: PlayerSession | null) => {
    setSession(newSession);
    if (newSession) {
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      } catch {
        // ignore
      }
    } else {
      try {
        localStorage.removeItem(SESSION_KEY);
      } catch {
        // ignore
      }
    }
  }, []);

  const subscribeToRoom = useCallback((roomId: string) => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    unsubscribeRef.current = serviceRef.current.subscribe(roomId, {
      onRoomUpdate: (r) => setRoom(r),
      onPlayersUpdate: (p) => setPlayers(p),
      onPicksUpdate: (p) => setPicks(p),
      onMessagesUpdate: (m) => setMessages(m),
      onOptionsUpdate: (o) => setOptions(o),
    });
  }, []);

  const cleanupSubscription = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
  }, []);

  // Reconnection on mount
  useEffect(() => {
    let active = true;
    const reconnect = async () => {
      if (session && session.roomCode && session.roomId && !room) {
        try {
          const data = await serviceRef.current.getRoomData(session.roomId);
          if (active && data.room.status !== 'closed') {
            setRoom(data.room);
            setPlayers(data.players);
            setOptions(data.options);
            setPicks(data.picks);
            setMessages(data.messages);
            await serviceRef.current.updateConnection(session.roomId, session.playerId, true);
            subscribeToRoom(session.roomId);

            if (data.room.status === 'drafting') setPhase('DRAFT');
            else if (data.room.status === 'finished') setPhase('RESULTS');
            else setPhase('LOBBY');
          }
        } catch {
          if (active) {
            persistSession({ ...session, roomCode: null, roomId: null });
            setPhase('HOME');
          }
        }
      }
    };
    reconnect();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync phase with room status
  useEffect(() => {
    if (!room) return;
    if (room.status === 'drafting' && phase !== 'DRAFT') setPhase('DRAFT');
    else if (room.status === 'finished' && phase !== 'RESULTS') setPhase('RESULTS');
    else if (
      room.status === 'lobby' &&
      phase !== 'LOBBY' &&
      phase !== 'HOME' &&
      phase !== 'CREATE_ROOM' &&
      phase !== 'JOIN_ROOM'
    ) {
      setPhase('LOBBY');
    } else if (room.status === 'closed') {
      cleanupSubscription();
      setPhase('HOME');
    }
  }, [room?.status, phase, room, cleanupSubscription]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupSubscription();
    };
  }, [cleanupSubscription]);

  // Mark disconnected on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (room && session) {
        serviceRef.current.updateConnection(room.id, session.playerId, false).catch(() => {});
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [room, session]);

  const actions: GameActions = useMemo(() => ({
    createRoom: async (hostName: string, settings: DraftSettings) => {
      const playerId = session?.playerId || crypto.randomUUID();
      const newRoom = await serviceRef.current.createRoom(hostName, playerId, settings);
      persistSession({ playerId, playerName: hostName, roomCode: newRoom.code, roomId: newRoom.id });
      setRoom(newRoom);
      subscribeToRoom(newRoom.id);
      setPhase('LOBBY');
      return newRoom;
    },

    joinRoom: async (code: string, playerName: string) => {
      const playerId = session?.playerId || crypto.randomUUID();
      const result = await serviceRef.current.joinRoom(code, playerName, playerId);
      persistSession({ playerId, playerName, roomCode: result.room.code, roomId: result.room.id });
      setRoom(result.room);
      setPlayers(result.players);
      subscribeToRoom(result.room.id);

      const data = await serviceRef.current.getRoomData(result.room.id);
      setOptions(data.options);
      setPicks(data.picks);
      setMessages(data.messages);

      if (result.room.status === 'drafting') setPhase('DRAFT');
      else if (result.room.status === 'finished') setPhase('RESULTS');
      else setPhase('LOBBY');
    },

    leaveRoom: () => {
      if (room && session) {
        serviceRef.current.leaveRoom(room.id, session.playerId).catch(console.error);
      }
      cleanupSubscription();
      setRoom(null);
      setPlayers([]);
      setOptions([]);
      setPicks([]);
      setMessages([]);
      if (session) {
        persistSession({ ...session, roomCode: null, roomId: null });
      }
      setPhase('HOME');
    },

    startDraft: async () => {
      if (room && session) {
        await serviceRef.current.startDraft(room.id, session.playerId);
      }
    },

    makePick: async (optionId: string) => {
      if (room && session) {
        await serviceRef.current.makePick(room.id, session.playerId, optionId);
      }
    },

    sendChatMessage: async (message: string) => {
      if (room && session) {
        await serviceRef.current.sendMessage(room.id, session.playerId, session.playerName, message);
      }
    },

    kickPlayer: async (playerId: string) => {
      if (room && session) {
        await serviceRef.current.kickPlayer(room.id, session.playerId, playerId);
      }
    },

    updateSettings: async (settings: DraftSettings) => {
      if (room && session) {
        await serviceRef.current.updateRoomSettings(room.id, session.playerId, settings);
      }
    },

    addCustomOptions: async (optionsInput: CustomOptionInput[]) => {
      if (room && session) {
        await serviceRef.current.addCustomOptions(room.id, session.playerId, optionsInput);
      }
    },

    playAgain: async () => {
      if (room && session) {
        await serviceRef.current.resetDraft(room.id, session.playerId);
      }
    },

    cleanup: () => {
      cleanupSubscription();
      setRoom(null);
      setPlayers([]);
      setOptions([]);
      setPicks([]);
      setMessages([]);
      setPhase('HOME');
    },
  }), [session, room, persistSession, subscribeToRoom, cleanupSubscription]);

  const currentPlayer = useMemo(
    () => players.find((p) => p.id === session?.playerId) || null,
    [players, session?.playerId]
  );
  const isHost = currentPlayer?.isHost || false;

  // Derive active draft turn player
  const currentTurnPlayerId = useMemo(() => {
    if (!room || players.length === 0 || room.status !== 'drafting') return null;
    const sorted = [...players].sort((a, b) => a.draftOrder - b.draftOrder);
    const index = getCurrentPlayerIndex(room.currentTurn, sorted.length, room.settings.mode);
    return sorted[index]?.id || null;
  }, [room, players]);

  // Derived state object for convenience
  const state = useMemo(() => {
    const activeSettings = room?.settings || defaultSettings;
    const draftState =
      room && room.status === 'drafting'
        ? {
            currentTurn: {
              playerId: currentTurnPlayerId || '',
              turnNumber: room.currentTurn,
            },
            options,
            picks,
            timeRemaining: 0,
          }
        : null;

    return {
      room,
      roomId: room?.code || room?.id || '',
      players,
      options,
      picks,
      messages,
      settings: activeSettings,
      connected: currentPlayer ? currentPlayer.isConnected : true,
      myPlayer: currentPlayer,
      draftState,
    };
  }, [room, players, options, picks, messages, currentTurnPlayerId, currentPlayer]);

  return (
    <GameContext.Provider
      value={{
        session,
        room,
        players,
        options,
        picks,
        messages,
        currentPlayer,
        myPlayer: currentPlayer,
        isHost,
        phase,
        setPhase,
        actions,

        // Direct aliases
        startGame: actions.startDraft,
        leaveRoom: actions.leaveRoom,
        makePick: actions.makePick,
        sendMessage: actions.sendChatMessage,
        sendChatMessage: actions.sendChatMessage,
        updateSettings: actions.updateSettings,
        restartGame: actions.playAgain,
        playAgain: actions.playAgain,
        kickPlayer: actions.kickPlayer,
        setCustomOptions: actions.addCustomOptions,

        state,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextType {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
