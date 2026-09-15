import { FC } from 'react';
import { DraftOption } from '@/types';

interface Props {
  option: DraftOption;
  isPicked: boolean;
  pickedByName?: string;
  canPick: boolean;
  onPick: (id: string) => void;
  isSelecting?: boolean;
}

export const DraftCard: FC<Props> = ({ option, isPicked, pickedByName, canPick, onPick, isSelecting }) => {
  const stars = Math.round((option.rating || 0) / 20);

  return (
    <div className={`relative flex flex-col bg-zinc-900 rounded-xl border overflow-hidden transition-all duration-200
      ${isPicked ? 'border-zinc-800 opacity-60 grayscale-[0.8]' : 'border-zinc-700 hover:border-zinc-500 hover:-translate-y-1 hover:shadow-xl'}
      ${isSelecting ? 'scale-95 opacity-50' : ''}
    `}>
      <div className="aspect-square bg-zinc-800 flex items-center justify-center text-4xl relative overflow-hidden">
        {option.imageUrl ? (
          <img src={option.imageUrl} alt={option.name} className="w-full h-full object-cover" />
        ) : (
          <span>🎮</span> // Fallback icon
        )}
        
        {isPicked && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm z-10 p-2 text-center">
            <span className="text-xl mb-1">🔒</span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">ESCOLHIDO</span>
            <span className="text-xs text-zinc-300 mt-1 truncate w-full px-2">{pickedByName}</span>
          </div>
        )}
      </div>

      <div className="p-3 flex-1 flex flex-col">
        <h3 className="font-bold text-sm text-zinc-100 line-clamp-1 mb-1" title={option.name}>{option.name}</h3>
        <p className="text-xs text-zinc-400 line-clamp-2 flex-1 mb-2">{option.description}</p>
        
        <div className="flex justify-between items-center mt-auto">
          <div className="flex text-amber-400 text-xs">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i}>{i < stars ? '★' : '☆'}</span>
            ))}
          </div>
        </div>
      </div>

      {!isPicked && canPick && (
        <button 
          onClick={() => onPick(option.id)}
          className="w-full bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold py-2 border-t border-emerald-700/50 transition-colors"
        >
          ESCOLHER
        </button>
      )}
    </div>
  );
};
