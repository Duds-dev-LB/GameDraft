import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { LobbyView } from '@/components/room/LobbyView';
import { DraftView } from '@/components/draft/DraftView';
import { ResultsView } from '@/components/results/ResultsView';
import { Button } from '@/components/ui/Button';

export function RoomPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { room, currentPlayer } = useGame();

  useEffect(() => {
    if (!room && code) {
      navigate(`/join/${code}`, { replace: true });
    }
  }, [room, code, navigate]);

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isDisconnected = currentPlayer ? !currentPlayer.isConnected : false;

  return (
    <div className="flex-1 flex flex-col relative w-full h-full max-w-7xl mx-auto">
      {isDisconnected && (
        <div className="bg-amber-600/90 text-white text-center py-2 px-4 text-sm font-bold sticky top-0 left-0 w-full z-30 shadow-md">
          🟡 Desconectado. Reconectando...
        </div>
      )}

      {room.status === 'lobby' && <LobbyView />}
      {room.status === 'drafting' && <DraftView />}
      {room.status === 'finished' && <ResultsView />}
      {room.status === 'closed' && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[50vh]">
          <span className="text-5xl mb-4">🚪</span>
          <h2 className="text-3xl font-black mb-4">Sala Encerrada</h2>
          <p className="text-surface-400 mb-8 max-w-md">
            Esta sala foi encerrada pelo host ou por inatividade.
          </p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Voltar ao Início
          </Button>
        </div>
      )}
    </div>
  );
}
