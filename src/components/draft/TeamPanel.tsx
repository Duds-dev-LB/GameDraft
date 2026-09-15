import type { FC } from 'react';
import type { Pick, DraftOption, Player } from '@/types';
import { Avatar } from '@/components/ui/Avatar';

interface Props {
  myPicks: (Pick & { option: DraftOption })[];
  opponents: { player: Player; pickCount: number }[];
}

export const TeamPanel: FC<Props> = ({ myPicks, opponents }) => {
  return (
    <div className="flex flex-col h-full p-4 gap-6">
      {/* My Team Section */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold text-surface-400 uppercase tracking-wider flex justify-between items-center">
          <span>Seu Time</span>
          <span className="bg-primary-900/60 text-primary-300 font-mono text-xs px-2 py-0.5 rounded-full">
            {myPicks.length}
          </span>
        </h3>

        <div className="flex flex-col gap-2">
          {myPicks.length === 0 ? (
            <div className="p-4 border border-dashed border-surface-800 rounded-xl text-center text-surface-500 text-sm">
              Nenhuma escolha feita ainda
            </div>
          ) : (
            myPicks.map((pick, i) => (
              <div
                key={pick.id}
                className="flex items-center gap-3 bg-surface-900/80 p-2.5 rounded-xl border border-surface-800"
              >
                <div className="w-9 h-9 rounded-lg bg-surface-800 flex items-center justify-center shrink-0 overflow-hidden text-lg">
                  {pick.option.imageUrl ? (
                    <span className="text-xl">{pick.option.imageUrl}</span>
                  ) : (
                    '🎯'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-surface-200 truncate">
                    {pick.option.name}
                  </p>
                  <p className="text-xs text-amber-400 font-mono">
                    Rating: {pick.option.rating}
                  </p>
                </div>
                <div className="text-xs font-mono text-surface-500 px-1">
                  #{i + 1}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Opponents Section */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold text-surface-400 uppercase tracking-wider">
          Adversários
        </h3>
        <div className="flex flex-col gap-2">
          {opponents.length === 0 && (
            <span className="text-sm text-surface-600">Nenhum adversário</span>
          )}
          {opponents.map((opp) => (
            <div
              key={opp.player.id}
              className="flex items-center gap-3 bg-surface-900/80 p-2.5 rounded-xl border border-surface-800"
            >
              <Avatar
                name={opp.player.name}
                seed={opp.player.avatarSeed}
                size="sm"
              />
              <span className="flex-1 text-sm font-medium text-surface-300 truncate">
                {opp.player.name}
              </span>
              <span className="text-xs font-mono bg-surface-800 text-surface-400 px-2 py-1 rounded-md">
                {opp.pickCount} escolhas
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
