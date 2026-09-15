import { useMemo, useEffect } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { useSound } from '@/hooks/useSound';
import { Button } from '@/components/ui/Button';
import { PlayerResultCard } from './PlayerResultCard';
import { ComparisonTable } from './ComparisonTable';
import { ShareButton } from './ShareButton';
import { calculatePlayerScore, determineWinner } from '@/utils/scoring';

export const ResultsView: FC = () => {
  const navigate = useNavigate();
  const { players, options, picks, isHost, actions } = useGame();
  const { playComplete } = useSound();

  // Play fanfare on load
  useEffect(() => {
    playComplete();
  }, [playComplete]);

  // Compute results
  const results = useMemo(() => {
    if (players.length === 0) return [];
    const res = players.map((p) => calculatePlayerScore(p, picks, options));
    return res.sort((a, b) => b.totalScore - a.totalScore);
  }, [players, picks, options]);

  const winner = useMemo(() => determineWinner(results), [results]);

  const handlePlayAgain = async () => {
    try {
      await actions.playAgain();
    } catch (err) {
      console.error('Error restarting draft:', err);
    }
  };

  const handleLeave = () => {
    actions.leaveRoom();
    navigate('/');
  };

  const handleCreateNew = () => {
    actions.leaveRoom();
    navigate('/create');
  };

  if (results.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-surface-400">Carregando resultados do draft...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-140px)] w-full max-w-6xl mx-auto px-4 py-8 overflow-y-auto">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <header className="text-center space-y-3 pt-4 animate-in fade-in zoom-in duration-500">
          <div className="inline-block p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-4xl mb-1">
            🏆
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-primary-400 to-accent-400 tracking-tight">
            DRAFT FINALIZADO!
          </h1>
          <p className="text-lg text-surface-400 max-w-xl mx-auto">
            Todas as escolhas foram feitas! Confira os times formados e a classificação final.
          </p>
        </header>

        {/* Player Result Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {results.map((r) => (
            <PlayerResultCard
              key={r.player.id}
              result={r}
              isWinner={r.player.id === winner?.player.id}
            />
          ))}
        </div>

        {/* Direct Comparison Table */}
        <div className="bg-surface-900/80 rounded-2xl border border-surface-800 p-6 overflow-hidden mt-4">
          <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
            <span>📊 Comparação Direta</span>
          </h2>
          <ComparisonTable results={results} />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center items-center gap-4 mt-6 pb-12">
          {winner && (
            <ShareButton
              winnerName={winner.player.name}
              winnerScore={winner.totalScore}
            />
          )}

          {isHost && (
            <Button
              onClick={handlePlayAgain}
              variant="primary"
              size="lg"
              className="px-8 font-bold shadow-lg shadow-primary-600/30"
            >
              🔄 JOGAR NOVAMENTE
            </Button>
          )}

          <Button
            onClick={handleCreateNew}
            variant="secondary"
            size="lg"
            className="px-6"
          >
            ➕ CRIAR NOVA SALA
          </Button>

          <Button
            onClick={handleLeave}
            variant="ghost"
            size="lg"
            className="text-surface-400 hover:text-white"
          >
            Sair para o Início
          </Button>
        </div>
      </div>
    </div>
  );
};
