import type { FC } from 'react';
import type { Pick, Player, DraftOption } from '@/types';
import { getAvatarColor } from '@/utils/avatar';

interface Props {
  picks: Pick[];
  players: Player[];
  options: DraftOption[];
}

export const DraftHistory: FC<Props> = ({ picks, players, options }) => {
  return (
    <div className="flex flex-col h-full bg-surface-950/40 p-4">
      <h3 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-3 flex items-center justify-between">
        <span>Histórico do Draft</span>
        <span className="font-mono text-xs text-surface-500">{picks.length} escolhas</span>
      </h3>

      <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 max-h-[300px]">
        {picks.length === 0 ? (
          <p className="text-sm text-surface-600 italic">O draft ainda não começou.</p>
        ) : (
          [...picks].reverse().map((pick, index) => {
            const p = players.find((x) => x.id === pick.playerId);
            const o = options.find((x) => x.id === pick.optionId);
            const pickNum = picks.length - index;
            const playerColor = p ? getAvatarColor(p.avatarSeed) : '#a5b4fc';

            return (
              <div
                key={pick.id}
                className="text-sm border-l-2 pl-3 py-1 border-surface-700 bg-surface-900/30 rounded-r-lg"
              >
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="text-xs font-mono text-surface-500 font-semibold">
                    Rodada {pick.roundNumber} • #{pickNum}
                  </span>
                  <span className="text-[10px] text-surface-500">
                    {new Date(pick.pickedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
                <div className="text-surface-300 leading-snug">
                  <span className="font-bold" style={{ color: playerColor }}>
                    {p?.name || 'Alguém'}
                  </span>
                  {pick.isTimeout ? (
                    <span className="text-danger-400 font-medium italic">
                      {' '}perdeu a vez por tempo esgotado.
                    </span>
                  ) : (
                    <>
                      {' escolheu '}
                      <span className="font-semibold text-accent-400">
                        {o?.name || 'Opção desconhecida'}
                      </span>
                      {o?.rating && (
                        <span className="text-xs text-amber-400 font-mono ml-1.5">
                          ({o.rating})
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
