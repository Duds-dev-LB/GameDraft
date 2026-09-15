import type { DraftOption, Pick, Player, PlayerResult } from '@/types';

export function calculatePlayerScore(
  player: Player,
  picks: Pick[],
  options: DraftOption[]
): PlayerResult {
  const playerPicks = picks
    .filter((p) => p.playerId === player.id)
    .map((p) => ({
      ...p,
      option: options.find((o) => o.id === p.optionId) || {
        id: p.optionId,
        roomId: p.roomId,
        name: 'Opção',
        imageUrl: '',
        description: '',
        category: '',
        rating: 50,
        tags: [],
        metadata: {},
      },
    }));

  let totalScore = 0;
  let bestPick: DraftOption | null = null;
  let worstPick: DraftOption | null = null;

  for (const item of playerPicks) {
    const rating = item.option.rating || 50;
    totalScore += rating;
    if (!bestPick || rating > (bestPick.rating || 0)) {
      bestPick = item.option;
    }
    if (!worstPick || rating < (worstPick.rating || 0)) {
      worstPick = item.option;
    }
  }

  const averageScore =
    playerPicks.length > 0
      ? Math.round((totalScore / playerPicks.length) * 10) / 10
      : 0;

  return {
    player,
    picks: playerPicks,
    totalScore,
    averageScore,
    bestPick,
    worstPick,
  };
}

export function determineWinner(results: PlayerResult[]): PlayerResult | null {
  if (!results || results.length === 0) return null;

  let winner = results[0];
  for (let i = 1; i < results.length; i++) {
    if (results[i].totalScore > winner.totalScore) {
      winner = results[i];
    }
  }

  return winner;
}
