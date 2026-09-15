import type { Player } from '@/types';

export function getCurrentPlayerIndex(currentTurn: number, playerCount: number, mode: 'classic' | 'snake'): number {
  if (playerCount === 0) return 0;
  const round = Math.floor(currentTurn / playerCount);
  const positionInRound = currentTurn % playerCount;

  if (mode === 'snake' && round % 2 !== 0) {
    // Reverse order for odd rounds (0-indexed, so round 1 is the second round)
    return playerCount - 1 - positionInRound;
  }
  
  return positionInRound;
}

export function getTotalTurns(playerCount: number, picksPerPlayer: number): number {
  return playerCount * picksPerPlayer;
}

export function getCurrentRound(currentTurn: number, playerCount: number): number {
  if (playerCount === 0) return 1;
  return Math.floor(currentTurn / playerCount) + 1;
}

export function isDraftFinished(currentTurn: number, playerCount: number, picksPerPlayer: number): boolean {
  return currentTurn >= getTotalTurns(playerCount, picksPerPlayer);
}

export function generateDraftOrder(players: Player[]): Player[] {
  const shuffled = [...players];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.map((player, index) => ({
    ...player,
    draftOrder: index
  }));
}
