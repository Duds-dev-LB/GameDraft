import type { GameService } from './types';
import type {
  Room,
  Player,
  DraftOption,
  Pick,
  ChatMessage,
  DraftSettings,
  CustomOptionInput,
} from '@/types';
import type { RoomCallbacks } from './types';
import { generateRoomCode } from '@/utils/room-code';
import { getCurrentPlayerIndex, isDraftFinished, getCurrentRound } from '@/utils/draft-engine';
import { getOptionsForCategory } from '@/data';

// ============================================================
// LocalProvider — In-memory game service with BroadcastChannel
// ============================================================

interface RoomStore {
  room: Room;
  players: Player[];
  options: DraftOption[];
  picks: Pick[];
  messages: ChatMessage[];
}

const rooms = new Map<string, RoomStore>();
const codeToId = new Map<string, string>();

let broadcastChannel: BroadcastChannel | null = null;

function getBroadcastChannel(): BroadcastChannel {
  if (!broadcastChannel) {
    broadcastChannel = new BroadcastChannel('gamedraft_local');
  }
  return broadcastChannel;
}

function broadcastUpdate(roomId: string, type: string) {
  try {
    getBroadcastChannel().postMessage({ roomId, type, timestamp: Date.now() });
  } catch {
    // BroadcastChannel not supported
  }
}

function getStore(roomId: string): RoomStore {
  const store = rooms.get(roomId);
  if (!store) throw new Error('Sala não encontrada');
  return store;
}

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

function templateToOption(
  template: { name: string; imageUrl: string; description: string; category: string; rating: number; tags: string[] },
  roomId: string
): DraftOption {
  return {
    id: generateId(),
    roomId,
    name: template.name,
    imageUrl: template.imageUrl,
    description: template.description,
    category: template.category,
    rating: template.rating,
    tags: template.tags,
    metadata: {},
  };
}

export class LocalProvider implements GameService {
  private subscriptions = new Map<string, RoomCallbacks>();

  constructor() {
    try {
      getBroadcastChannel().onmessage = (event) => {
        const { roomId, type } = event.data;
        this.notifySubscribers(roomId, type);
      };
    } catch {
      // BroadcastChannel not supported
    }
  }

  private notifySubscribers(roomId: string, type?: string) {
    const callbacks = this.subscriptions.get(roomId);
    const store = rooms.get(roomId);
    if (!callbacks || !store) return;

    if (!type || type === 'room') callbacks.onRoomUpdate({ ...store.room });
    if (!type || type === 'players') callbacks.onPlayersUpdate([...store.players]);
    if (!type || type === 'picks') callbacks.onPicksUpdate([...store.picks]);
    if (!type || type === 'messages') callbacks.onMessagesUpdate([...store.messages]);
    if (!type || type === 'options') callbacks.onOptionsUpdate([...store.options]);
  }

  async createRoom(hostName: string, hostId: string, settings: DraftSettings): Promise<Room> {
    let code = generateRoomCode();
    while (codeToId.has(code)) {
      code = generateRoomCode();
    }

    const roomId = generateId();

    const room: Room = {
      id: roomId,
      code,
      hostId,
      status: 'lobby',
      settings,
      currentTurn: 0,
      turnStartedAt: null,
      createdAt: now(),
      updatedAt: now(),
    };

    const host: Player = {
      id: hostId,
      roomId,
      name: hostName,
      avatarSeed: hostId.slice(0, 8),
      isHost: true,
      isConnected: true,
      draftOrder: 0,
      joinedAt: now(),
    };

    // Load options for the category
    const templates = getOptionsForCategory(settings.category);
    const options = templates.map((t) => templateToOption(t, roomId));

    const store: RoomStore = {
      room,
      players: [host],
      options,
      picks: [],
      messages: [],
    };

    rooms.set(roomId, store);
    codeToId.set(code, roomId);

    return room;
  }

  async joinRoom(code: string, playerName: string, playerId: string): Promise<{ room: Room; players: Player[] }> {
    const roomId = codeToId.get(code.toUpperCase());
    if (!roomId) throw new Error('Sala não encontrada. Verifique o código e tente novamente.');

    const store = getStore(roomId);

    if (store.room.status === 'closed') {
      throw new Error('Esta sala foi encerrada.');
    }

    if (store.room.status === 'finished') {
      throw new Error('Esta partida já foi finalizada.');
    }

    // Check if player is reconnecting
    const existing = store.players.find((p) => p.id === playerId);
    if (existing) {
      existing.isConnected = true;
      existing.name = playerName;
      broadcastUpdate(roomId, 'players');
      this.notifySubscribers(roomId, 'players');
      return { room: { ...store.room }, players: [...store.players] };
    }

    if (store.players.length >= store.room.settings.maxPlayers) {
      throw new Error('Esta sala está cheia.');
    }

    if (store.room.status === 'drafting') {
      throw new Error('O draft já começou nesta sala.');
    }

    const player: Player = {
      id: playerId,
      roomId,
      name: playerName,
      avatarSeed: playerId.slice(0, 8),
      isHost: false,
      isConnected: true,
      draftOrder: store.players.length,
      joinedAt: now(),
    };

    store.players.push(player);
    broadcastUpdate(roomId, 'players');
    this.notifySubscribers(roomId, 'players');

    return { room: { ...store.room }, players: [...store.players] };
  }

  async leaveRoom(roomId: string, playerId: string): Promise<void> {
    const store = rooms.get(roomId);
    if (!store) return;

    const playerIndex = store.players.findIndex((p) => p.id === playerId);
    if (playerIndex === -1) return;

    const player = store.players[playerIndex];

    if (player.isHost && store.players.length > 1) {
      // Transfer host to next connected player
      const nextHost = store.players.find((p) => p.id !== playerId && p.isConnected);
      if (nextHost) {
        nextHost.isHost = true;
        store.room.hostId = nextHost.id;
      }
    }

    if (store.room.status === 'lobby') {
      store.players.splice(playerIndex, 1);
      // Reindex draft order
      store.players.forEach((p, i) => {
        p.draftOrder = i;
      });
    } else {
      player.isConnected = false;
    }

    if (store.players.filter((p) => p.isConnected).length === 0) {
      store.room.status = 'closed';
    }

    store.room.updatedAt = now();
    broadcastUpdate(roomId, 'room');
    broadcastUpdate(roomId, 'players');
    this.notifySubscribers(roomId, 'room');
    this.notifySubscribers(roomId, 'players');
  }

  async getRoom(code: string): Promise<Room | null> {
    const roomId = codeToId.get(code.toUpperCase());
    if (!roomId) return null;
    const store = rooms.get(roomId);
    return store ? { ...store.room } : null;
  }

  async getRoomData(roomId: string): Promise<{
    room: Room;
    players: Player[];
    options: DraftOption[];
    picks: Pick[];
    messages: ChatMessage[];
  }> {
    const store = getStore(roomId);
    return {
      room: { ...store.room },
      players: [...store.players],
      options: [...store.options],
      picks: [...store.picks],
      messages: [...store.messages],
    };
  }

  async startDraft(roomId: string, playerId: string): Promise<void> {
    const store = getStore(roomId);

    if (store.room.hostId !== playerId) {
      throw new Error('Apenas o host pode iniciar o draft.');
    }

    if (store.players.length < 2) {
      throw new Error('São necessários pelo menos 2 jogadores para iniciar.');
    }

    if (store.room.status !== 'lobby') {
      throw new Error('O draft já foi iniciado.');
    }

    // Shuffle draft order
    const shuffled = [...store.players].sort(() => Math.random() - 0.5);
    shuffled.forEach((p, i) => {
      const player = store.players.find((sp) => sp.id === p.id)!;
      player.draftOrder = i;
    });

    store.room.status = 'drafting';
    store.room.currentTurn = 0;
    store.room.turnStartedAt = store.room.settings.timeLimit > 0 ? now() : null;
    store.room.updatedAt = now();

    broadcastUpdate(roomId, 'room');
    broadcastUpdate(roomId, 'players');
    this.notifySubscribers(roomId, 'room');
    this.notifySubscribers(roomId, 'players');
  }

  async updateRoomSettings(roomId: string, playerId: string, settings: DraftSettings): Promise<void> {
    const store = getStore(roomId);

    if (store.room.hostId !== playerId) {
      throw new Error('Apenas o host pode alterar configurações.');
    }

    if (store.room.status !== 'lobby') {
      throw new Error('Não é possível alterar configurações durante o draft.');
    }

    store.room.settings = settings;
    store.room.updatedAt = now();

    // Reload options if category changed
    const templates = getOptionsForCategory(settings.category);
    store.options = templates.map((t) => templateToOption(t, roomId));

    broadcastUpdate(roomId, 'room');
    broadcastUpdate(roomId, 'options');
    this.notifySubscribers(roomId, 'room');
    this.notifySubscribers(roomId, 'options');
  }

  async kickPlayer(roomId: string, hostId: string, targetPlayerId: string): Promise<void> {
    const store = getStore(roomId);

    if (store.room.hostId !== hostId) {
      throw new Error('Apenas o host pode remover jogadores.');
    }

    const index = store.players.findIndex((p) => p.id === targetPlayerId);
    if (index === -1) return;

    store.players.splice(index, 1);
    store.players.forEach((p, i) => {
      p.draftOrder = i;
    });

    broadcastUpdate(roomId, 'players');
    this.notifySubscribers(roomId, 'players');
  }

  async transferHost(roomId: string, currentHostId: string, newHostId: string): Promise<void> {
    const store = getStore(roomId);

    if (store.room.hostId !== currentHostId) {
      throw new Error('Apenas o host atual pode transferir a função.');
    }

    const currentHost = store.players.find((p) => p.id === currentHostId);
    const newHost = store.players.find((p) => p.id === newHostId);

    if (!newHost) throw new Error('Jogador não encontrado.');

    if (currentHost) currentHost.isHost = false;
    newHost.isHost = true;
    store.room.hostId = newHostId;
    store.room.updatedAt = now();

    broadcastUpdate(roomId, 'room');
    broadcastUpdate(roomId, 'players');
    this.notifySubscribers(roomId, 'room');
    this.notifySubscribers(roomId, 'players');
  }

  async makePick(roomId: string, playerId: string, optionId: string): Promise<Pick> {
    const store = getStore(roomId);

    if (store.room.status !== 'drafting') {
      throw new Error('O draft não está em andamento.');
    }

    // Validate it's the player's turn
    const sortedPlayers = [...store.players].sort((a, b) => a.draftOrder - b.draftOrder);
    const expectedIndex = getCurrentPlayerIndex(
      store.room.currentTurn,
      sortedPlayers.length,
      store.room.settings.mode
    );
    const expectedPlayer = sortedPlayers[expectedIndex];

    if (expectedPlayer.id !== playerId) {
      throw new Error('Não é sua vez de escolher.');
    }

    // Validate option not already picked
    if (store.picks.some((p) => p.optionId === optionId)) {
      throw new Error('Esta opção já foi escolhida.');
    }

    // Validate option exists
    if (!store.options.some((o) => o.id === optionId)) {
      throw new Error('Opção inválida.');
    }

    const pick: Pick = {
      id: generateId(),
      roomId,
      playerId,
      optionId,
      roundNumber: getCurrentRound(store.room.currentTurn, sortedPlayers.length),
      turnNumber: store.room.currentTurn,
      pickedAt: now(),
      isTimeout: false,
    };

    store.picks.push(pick);
    store.room.currentTurn += 1;
    store.room.updatedAt = now();

    // Check if draft is finished
    if (isDraftFinished(store.room.currentTurn, sortedPlayers.length, store.room.settings.picksPerPlayer)) {
      store.room.status = 'finished';
      store.room.turnStartedAt = null;
    } else if (store.room.settings.timeLimit > 0) {
      store.room.turnStartedAt = now();
    }

    broadcastUpdate(roomId, 'room');
    broadcastUpdate(roomId, 'picks');
    this.notifySubscribers(roomId, 'room');
    this.notifySubscribers(roomId, 'picks');

    return pick;
  }

  async skipTurn(roomId: string, _playerId: string): Promise<void> {
    const store = getStore(roomId);

    if (store.room.status !== 'drafting') return;

    const sortedPlayers = [...store.players].sort((a, b) => a.draftOrder - b.draftOrder);

    // Create a timeout pick (no option)
    store.room.currentTurn += 1;
    store.room.updatedAt = now();

    if (isDraftFinished(store.room.currentTurn, sortedPlayers.length, store.room.settings.picksPerPlayer)) {
      store.room.status = 'finished';
      store.room.turnStartedAt = null;
    } else if (store.room.settings.timeLimit > 0) {
      store.room.turnStartedAt = now();
    }

    broadcastUpdate(roomId, 'room');
    this.notifySubscribers(roomId, 'room');
  }

  async setOptions(roomId: string, playerId: string, options: DraftOption[]): Promise<void> {
    const store = getStore(roomId);

    if (store.room.hostId !== playerId) {
      throw new Error('Apenas o host pode definir as opções.');
    }

    store.options = options;
    broadcastUpdate(roomId, 'options');
    this.notifySubscribers(roomId, 'options');
  }

  async addCustomOptions(roomId: string, playerId: string, inputs: CustomOptionInput[]): Promise<DraftOption[]> {
    const store = getStore(roomId);

    if (store.room.hostId !== playerId) {
      throw new Error('Apenas o host pode adicionar opções.');
    }

    const newOptions: DraftOption[] = inputs.map((input, index) => ({
      id: generateId(),
      roomId,
      name: input.name,
      imageUrl: input.imageUrl || '🎯',
      description: input.description || '',
      category: 'custom',
      rating: Math.max(50, 99 - index * 3),
      tags: ['custom'],
      metadata: {},
    }));

    store.options.push(...newOptions);
    broadcastUpdate(roomId, 'options');
    this.notifySubscribers(roomId, 'options');

    return newOptions;
  }

  async sendMessage(roomId: string, playerId: string, playerName: string, message: string): Promise<void> {
    const store = getStore(roomId);

    const chatMessage: ChatMessage = {
      id: generateId(),
      roomId,
      playerId,
      playerName,
      message: message.slice(0, 500),
      sentAt: now(),
    };

    store.messages.push(chatMessage);
    broadcastUpdate(roomId, 'messages');
    this.notifySubscribers(roomId, 'messages');
  }

  async resetDraft(roomId: string, playerId: string): Promise<void> {
    const store = getStore(roomId);

    if (store.room.hostId !== playerId) {
      throw new Error('Apenas o host pode reiniciar o draft.');
    }

    store.room.status = 'lobby';
    store.room.currentTurn = 0;
    store.room.turnStartedAt = null;
    store.room.updatedAt = now();
    store.picks = [];

    broadcastUpdate(roomId, 'room');
    broadcastUpdate(roomId, 'picks');
    this.notifySubscribers(roomId, 'room');
    this.notifySubscribers(roomId, 'picks');
  }

  subscribe(roomId: string, callbacks: RoomCallbacks): () => void {
    this.subscriptions.set(roomId, callbacks);

    // Initial data push
    const store = rooms.get(roomId);
    if (store) {
      callbacks.onRoomUpdate({ ...store.room });
      callbacks.onPlayersUpdate([...store.players]);
      callbacks.onOptionsUpdate([...store.options]);
      callbacks.onPicksUpdate([...store.picks]);
      callbacks.onMessagesUpdate([...store.messages]);
    }

    return () => {
      this.subscriptions.delete(roomId);
    };
  }

  async updateConnection(roomId: string, playerId: string, connected: boolean): Promise<void> {
    const store = rooms.get(roomId);
    if (!store) return;

    const player = store.players.find((p) => p.id === playerId);
    if (player) {
      player.isConnected = connected;
      broadcastUpdate(roomId, 'players');
      this.notifySubscribers(roomId, 'players');
    }
  }

  // --- Demo Mode: Bot system ---

  async createDemoRoom(hostName: string, hostId: string): Promise<Room> {
    const settings: DraftSettings = {
      category: 'football',
      mode: 'snake',
      maxPlayers: 4,
      timeLimit: 30,
      picksPerPlayer: 5,
    };

    const room = await this.createRoom(hostName, hostId, settings);
    const store = getStore(room.id);

    // Add bot players
    const botNames = ['Bot Carlos', 'Bot Ana', 'Bot Rafael'];
    for (const botName of botNames) {
      const botId = generateId();
      const bot: Player = {
        id: botId,
        roomId: room.id,
        name: botName,
        avatarSeed: botId.slice(0, 8),
        isHost: false,
        isConnected: true,
        draftOrder: store.players.length,
        joinedAt: now(),
      };
      store.players.push(bot);
    }

    this.notifySubscribers(room.id, 'players');
    return room;
  }

  startBotPicks(roomId: string, myPlayerId: string) {
    const interval = setInterval(() => {
      const store = rooms.get(roomId);
      if (!store || store.room.status !== 'drafting') {
        clearInterval(interval);
        return;
      }

      const sortedPlayers = [...store.players].sort((a, b) => a.draftOrder - b.draftOrder);
      const expectedIndex = getCurrentPlayerIndex(
        store.room.currentTurn,
        sortedPlayers.length,
        store.room.settings.mode
      );
      const currentPlayer = sortedPlayers[expectedIndex];

      // Only auto-pick for bots (not the real player)
      if (currentPlayer.id === myPlayerId) return;

      const pickedIds = new Set(store.picks.map((p) => p.optionId));
      const available = store.options.filter((o) => !pickedIds.has(o.id));

      if (available.length === 0) return;

      // Pick a random available option
      const option = available[Math.floor(Math.random() * available.length)];
      this.makePick(roomId, currentPlayer.id, option.id).catch(() => {
        clearInterval(interval);
      });
    }, 2000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }
}
