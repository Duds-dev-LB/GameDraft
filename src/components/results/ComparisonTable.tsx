import type { FC } from 'react';
import type { PlayerResult } from '@/types';

interface Props {
  results: PlayerResult[];
}

export const ComparisonTable: FC<Props> = ({ results }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr>
            <th className="p-3.5 bg-surface-950/60 text-xs font-bold text-surface-400 uppercase tracking-wider border-b border-surface-800">
              Métrica
            </th>
            {results.map((r, i) => (
              <th
                key={r.player.id}
                className={`p-3.5 bg-surface-950/60 border-b border-surface-800 text-center font-bold ${
                  i === 0 ? 'text-amber-400' : 'text-surface-200'
                }`}
              >
                {r.player.name}
                {i === 0 && ' 🏆'}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-surface-800/60">
          <tr>
            <td className="p-3.5 font-medium text-surface-400">Pontuação Total</td>
            {results.map((r, i) => (
              <td
                key={r.player.id}
                className={`p-3.5 text-center font-bold font-mono ${
                  i === 0 ? 'text-accent-400 text-lg' : 'text-surface-200'
                }`}
              >
                {Math.round(r.totalScore)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-3.5 font-medium text-surface-400">Média por Escolha</td>
            {results.map((r) => (
              <td key={r.player.id} className="p-3.5 text-center font-mono text-surface-300">
                {r.averageScore.toFixed(1)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-3.5 font-medium text-surface-400">Melhor Escolha</td>
            {results.map((r) => (
              <td key={r.player.id} className="p-3.5 text-center">
                {r.bestPick ? (
                  <div className="flex flex-col items-center">
                    <span className="text-surface-200 truncate max-w-[130px] font-medium">
                      {r.bestPick.name}
                    </span>
                    <span className="text-xs text-amber-400 font-mono font-bold">
                      {r.bestPick.rating} pts
                    </span>
                  </div>
                ) : (
                  '-'
                )}
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-3.5 font-medium text-surface-400">Pior Escolha</td>
            {results.map((r) => (
              <td key={r.player.id} className="p-3.5 text-center">
                {r.worstPick ? (
                  <div className="flex flex-col items-center">
                    <span className="text-surface-400 truncate max-w-[130px]">
                      {r.worstPick.name}
                    </span>
                    <span className="text-xs text-danger-400 font-mono">
                      {r.worstPick.rating} pts
                    </span>
                  </div>
                ) : (
                  '-'
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};
