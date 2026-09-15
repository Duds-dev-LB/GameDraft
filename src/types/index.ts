// ============================================================
// GameDraft — Core Type Definitions
// ============================================================

// --- Room ---

export type RoomStatus = 'lobby' | 'drafting' | 'finished' | 'closed';

export type DraftMode = 'classic' | 'snake';

export type DraftCategory = 'football' | 'nba' | 'games' | 'characters' | 'custom';

export type TimeLimitSeconds = 0 | 15 | 30 | 45 | 60;

export type PicksPerPlayer = 3 | 5 | 7 | 10;

export interface DraftSettings {
  category: DraftCategory;
  mode: DraftMode;
  maxPlayers: number; // 2-8
  timeLimit: TimeLimitSeconds;
  picksPerPlayer: PicksPerPlayer;
}

export interface Room {
  id: string;
  code: string;
  hostId: string;
  status: RoomStatus;
  settings: DraftSettings;
  currentTurn: number;
  turnStartedAt: string | null; // ISO timestamp
  createdAt: string;
  updatedAt: string;
}

// --- Player ---

export interface Player {
  id: string;
  roomId: string;
  name: string;
  avatarSeed: string;
  isHost: boolean;
  isConnected: boolean;
  draftOrder: number;
  joinedAt: string;
}

// --- Draft Option ---

export interface DraftOption {
  id: string;
  roomId: string;
  name: string;
  imageUrl: string;
  description: string;
  category: string;
  rating: number; // 0-99
  tags: string[];
  metadata: Record<string, unknown>;
}

// --- Pick ---

export interface Pick {
  id: string;
  roomId: string;
  playerId: string;
  optionId: string;
  roundNumber: number;
  turnNumber: number;
  pickedAt: string;
  isTimeout: boolean;
}

// --- Chat ---

export interface ChatMessage {
  id: string;
  roomId: string;
  playerId: string;
  playerName: string;
  message: string;
  sentAt: string;
}

// --- App State ---

export type AppPhase =
  | 'HOME'
  | 'CREATE_ROOM'
  | 'JOIN_ROOM'
  | 'LOBBY'
  | 'SETUP'
  | 'DRAFT'
  | 'RESULTS';

// --- Session ---

export interface PlayerSession {
  playerId: string;
  playerName: string;
  roomCode: string | null;
  roomId: string | null;
}

// --- Draft State (derived) ---

export interface DraftState {
  room: Room;
  players: Player[];
  options: DraftOption[];
  picks: Pick[];
  currentPlayerId: string | null;
  currentRound: number;
  totalRounds: number;
  isMyTurn: boolean;
  isFinished: boolean;
}

// --- Results ---

export interface PlayerResult {
  player: Player;
  picks: (Pick & { option: DraftOption })[];
  totalScore: number;
  averageScore: number;
  bestPick: DraftOption | null;
  worstPick: DraftOption | null;
}

// --- Toast ---

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

// --- Settings ---

export interface UserSettings {
  soundEnabled: boolean;
  animationsEnabled: boolean;
  theme: 'dark';
}

// --- Service Interface ---

export interface CreateRoomParams {
  hostName: string;
  settings: DraftSettings;
}

export interface JoinRoomParams {
  code: string;
  playerName: string;
}

export interface MakePickParams {
  roomId: string;
  playerId: string;
  optionId: string;
}

// --- Data Templates ---

export interface DraftOptionTemplate {
  name: string;
  imageUrl: string;
  description: string;
  category: DraftCategory;
  rating: number;
  tags: string[];
}

// --- Custom Option Input ---

export interface CustomOptionInput {
  name: string;
  description?: string;
  imageUrl?: string;
}
