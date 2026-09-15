import { useState, FC } from 'react';
import { Button } from '@/components/ui/Button';

interface Props {
  winnerName: string;
  winnerScore: number;
}

export const ShareButton: FC<Props> = ({ winnerName, winnerScore }) => {
  const [copied, setCopied] = useState(false);

  const shareText = `Acabei de jogar um GameDraft! 🏆 Vencedor: ${winnerName} ⭐ Pontuação: ${Math.round(winnerScore)} Entre e desafie seus amigos!`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Resultados do GameDraft',
          text: shareText,
          url: window.location.origin
        });
      } catch (err) {
        // user cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(`${shareText} ${window.location.origin}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button 
      onClick={handleShare} 
      variant="secondary"
      className="w-full sm:w-auto h-12 px-6 flex items-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"></circle>
        <circle cx="6" cy="12" r="3"></circle>
        <circle cx="18" cy="19" r="3"></circle>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
      </svg>
      {copied ? 'Copiado!' : 'COMPARTILHAR RESULTADO'}
    </Button>
  );
};
