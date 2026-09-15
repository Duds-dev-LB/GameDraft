import type {
  Room,
  Player,
  DraftOption,
  Pick,
  ChatMessage,
  DraftSettings,
  CustomOptionInput,
} from '@/types';

// ============================================================
// GameService Interface — abstraction over Supabase / Local
// ============================================================

export interface RoomCallbacks {
  onRoomUpdate: (room: Room) => void;
  onPlayersUpdate: (players: Player[]) => void;
  onPicksUpdate: (picks: Pick[]) => void;
  onMessagesUpdate: (messages: ChatMessage[]) => void;
  onOptionsUpdate: (options: DraftOption[]) => void;
}

export interface GameService {
  // Room lifecycle
  createRoom(hostName: string, hostId: string, settings: DraftSettings): Promise<Room>;
  joinRoom(code: string, playerName: string, playerId: string): Promise<{ room: Room; players: Player[] }>;
  leaveRoom(roomId: string, playerId: string): Promise<void>;
  getRoom(code: string): Promise<Room | null>;

  // Room state
  getRoomData(roomId: string): Promise<{
    room: Room;
    players: Player[];
    options: DraftOption[];
    picks: Pick[];
    messages: ChatMessage[];
  }>;

  // Host actions
  startDraft(roomId: string, playerId: string): Promise<void>;
  updateRoomSettings(roomId: string, playerId: string, settings: DraftSettings): Promise<void>;
  kickPlayer(roomId: string, hostId: string, targetPlayerId: string): Promise<void>;
  transferHost(roomId: string, currentHostId: string, newHostId: string): Promise<void>;

  // Draft actions
  makePick(roomId: string, playerId: string, optionId: string): Promise<Pick>;
  skipTurn(roomId: string, playerId: string): Promise<void>;

  // Options
  setOptions(roomId: string, playerId: string, options: DraftOption[]): Promise<void>;
  addCustomOptions(roomId: string, playerId: string, options: CustomOptionInput[]): Promise<DraftOption[]>;

  // Chat
  sendMessage(roomId: string, playerId: string, playerName: string, message: string): Promise<void>;

  // Play again
  resetDraft(roomId: string, playerId: string): Promise<void>;

  // Real-time subscriptions
  subscribe(roomId: string, callbacks: RoomCallbacks): () => void;

  // Connection
  updateConnection(roomId: string, playerId: string, connected: boolean): Promise<void>;
}
