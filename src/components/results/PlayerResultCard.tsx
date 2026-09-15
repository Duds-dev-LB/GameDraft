import type { FC } from 'react';
import type { PlayerResult } from '@/types';
import { Avatar } from '@/components/ui/Avatar';

interface Props {
  result: PlayerResult;
  isWinner: boolean;
}

export const PlayerResultCard: FC<Props> = ({ result, isWinner }) => {
  return (
    <div
      className={`relative flex flex-col bg-surface-900 rounded-2xl border overflow-hidden transition-all ${
        isWinner
          ? 'border-amber-500/60 shadow-[0_0_35px_-5px_rgba(245,158,11,0.3)]'
          : 'border-surface-800'
      }`}
    >
      {isWinner && (
        <div className="absolute top-0 right-0 bg-amber-500 text-amber-950 font-black text-xs px-4 py-1.5 rounded-bl-xl z-10 tracking-wider">
          🏆 VENCEDOR
        </div>
      )}

      {/* Card Header */}
      <div className="p-6 border-b border-surface-800/80 bg-surface-950/40 flex items-center gap-4">
        <Avatar
          name={result.player.name}
          seed={result.player.avatarSeed}
          size="lg"
        />
        <div className="flex-1 min-w-0">
          <h2
            className={`text-xl font-bold truncate ${
              isWinner ? 'text-amber-300' : 'text-white'
            }`}
          >
            {result.player.name}
          </h2>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-accent-400 font-mono">
              {result.totalScore}
            </span>
            <span className="text-xs text-surface-500 font-medium uppercase tracking-wide">
              pts totais
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="p-4 grid grid-cols-3 gap-2 text-sm border-b border-surface-800/60 bg-surface-900/60">
        <div className="bg-surface-950/80 p-2.5 rounded-xl border border-surface-800/60 text-center">
          <span className="block text-xs text-surface-500 mb-0.5">Média</span>
          <span className="font-bold text-surface-200 font-mono">
            {result.averageScore}
          </span>
        </div>
        <div className="bg-surface-950/80 p-2.5 rounded-xl border border-surface-800/60 text-center">
          <span className="block text-xs text-surface-500 mb-0.5">Escolhas</span>
          <span className="font-bold text-surface-200 font-mono">
            {result.picks.length}
          </span>
        </div>
        <div className="bg-surface-950/80 p-2.5 rounded-xl border border-surface-800/60 text-center">
          <span className="block text-xs text-surface-500 mb-0.5">Top Rating</span>
          <span className="font-bold text-amber-400 font-mono">
            {result.bestPick?.rating || '-'}
          </span>
        </div>
      </div>

      {/* Formed Team */}
      <div className="p-4 flex-1">
        <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-3">
          Time Formado ({result.picks.length})
        </h3>
        <div className="flex flex-col gap-2">
          {result.picks.map((pick) => (
            <div
              key={pick.id}
              className="flex items-center gap-3 bg-surface-950/70 p-2 rounded-xl border border-surface-800/60"
            >
              <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center shrink-0 overflow-hidden text-base">
                {pick.option.imageUrl ? (
                  <span>{pick.option.imageUrl}</span>
                ) : (
                  '🎯'
                )}
              </div>
              <span className="flex-1 text-sm font-medium text-surface-200 truncate">
                {pick.option.name}
              </span>
              <span className="text-xs font-mono text-amber-400 px-2 py-0.5 rounded bg-amber-400/10 font-bold">
                {pick.option.rating || 50}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
