import { FC } from 'react';

interface Props {
  currentPlayerName: string;
  isMyTurn: boolean;
  currentPick: number;
  totalPicks: number;
  timeRemaining: number;
  timeLimit: number;
}

export const TurnIndicator: FC<Props> = ({ 
  currentPlayerName, isMyTurn, currentPick, totalPicks, timeRemaining, timeLimit 
}) => {
  const hasTimer = timeLimit > 0;
  const isDanger = hasTimer && timeRemaining <= 5;
  const isWarning = hasTimer && timeRemaining <= 10 && !isDanger;

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${isMyTurn ? 'border-emerald-500/50 bg-emerald-950/20 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]' : 'border-zinc-800 bg-zinc-900'} p-6 transition-all duration-300`}>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase mb-1">
            Escolha {currentPick} de {totalPicks}
          </span>
          <h2 className={`text-2xl md:text-3xl font-black ${isMyTurn ? 'text-emerald-400' : 'text-white'}`}>
            {isMyTurn ? '🔥 SUA VEZ!' : `AGORA É A VEZ DE ${currentPlayerName.toUpperCase()}`}
          </h2>
        </div>

        {hasTimer && (
          <div className="flex items-center gap-3 bg-black/40 px-5 py-3 rounded-xl border border-zinc-800/50">
            <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Tempo:</span>
            <span className={`text-3xl font-black font-mono ${
              isDanger ? 'text-red-500 animate-pulse' : 
              isWarning ? 'text-amber-500' : 'text-zinc-100'
            }`}>
              {timeRemaining}s
            </span>
          </div>
        )}
      </div>

      {hasTimer && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-zinc-800">
          <div 
            className={`h-full transition-all duration-1000 ease-linear ${isDanger ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: `${(timeRemaining / timeLimit) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
};
