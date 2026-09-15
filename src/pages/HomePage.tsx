import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { useToast } from '@/context/ToastContext';
import { getLocalProvider, isLocalMode } from '@/services/game-service';

export function HomePage() {
  const navigate = useNavigate();
  const { session, actions } = useGame();
  const { addToast } = useToast();

  const handleTestDemo = async () => {
    try {
      if (isLocalMode()) {
        const localProvider = getLocalProvider();
        if (localProvider && session) {
          const room = await localProvider.createDemoRoom('Jogador Demo', session.playerId);
          // Join through context to set up subscriptions
          await actions.joinRoom(room.code, 'Jogador Demo');
          navigate(`/room/${room.code}`);
          // Start bot picks after a delay
          setTimeout(() => {
            localProvider.startBotPicks(room.id, session.playerId);
          }, 1000);
          return;
        }
      }
      // Fallback: create a regular room
      const room = await actions.createRoom('Jogador Demo', {
        category: 'football',
        mode: 'snake',
        maxPlayers: 4,
        timeLimit: 30,
        picksPerPlayer: 5,
      });
      navigate(`/room/${room.code}`);
    } catch (error) {
      addToast('error', 'Erro ao criar sala demo.');
      console.error('Demo error:', error);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 py-20 lg:py-32 flex flex-col items-center text-center">
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
          <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">GameDraft</span>
        </h1>
        <p className="text-xl md:text-2xl text-surface-300 font-medium max-w-2xl mb-12">
          Monte seu time. Roube suas escolhas. Vença seus amigos.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md mx-auto">
          <Link to="/create" className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 text-center flex items-center justify-center">
            CRIAR SALA
          </Link>
          <Link to="/join" className="w-full sm:w-auto px-8 py-4 bg-surface-800 hover:bg-surface-700 text-white rounded-xl font-bold text-lg transition-all border border-surface-700 text-center">
            ENTRAR EM UMA SALA
          </Link>
        </div>
        
        <button 
          onClick={handleTestDemo}
          className="mt-8 text-surface-400 hover:text-white flex items-center gap-2 font-medium transition-colors"
        >
          <span className="text-lg">▶️</span>
          TESTAR DEMO
        </button>
      </section>

      {/* Como funciona */}
      <section className="w-full bg-surface-900 border-y border-surface-800 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-black text-center mb-16">Como funciona?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-surface-800/50 p-6 rounded-2xl border border-surface-700/50 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary-900/50 text-primary-400 rounded-full flex items-center justify-center text-xl font-black mb-4">1</div>
              <div className="text-primary-500 text-4xl mb-4">▶️</div>
              <h3 className="text-xl font-bold mb-2">Crie uma sala</h3>
              <p className="text-surface-400 text-sm">Escolha o tema do draft, defina o tempo e as regras.</p>
            </div>
            
            <div className="bg-surface-800/50 p-6 rounded-2xl border border-surface-700/50 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary-900/50 text-primary-400 rounded-full flex items-center justify-center text-xl font-black mb-4">2</div>
              <div className="text-primary-500 text-4xl mb-4">👥</div>
              <h3 className="text-xl font-bold mb-2">Convide amigos</h3>
              <p className="text-surface-400 text-sm">Compartilhe o código da sala para eles entrarem no lobby.</p>
            </div>
            
            <div className="bg-surface-800/50 p-6 rounded-2xl border border-surface-700/50 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary-900/50 text-primary-400 rounded-full flex items-center justify-center text-xl font-black mb-4">3</div>
              <div className="text-primary-500 text-4xl mb-4">⚔️</div>
              <h3 className="text-xl font-bold mb-2">Faça o draft</h3>
              <p className="text-surface-400 text-sm">Alterne as escolhas e garanta os melhores para o seu time.</p>
            </div>
            
            <div className="bg-surface-800/50 p-6 rounded-2xl border border-surface-700/50 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary-900/50 text-primary-400 rounded-full flex items-center justify-center text-xl font-black mb-4">4</div>
              <div className="text-primary-500 text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold mb-2">Compare os times</h3>
              <p className="text-surface-400 text-sm">Ao final, votem e decidam qual time ficou melhor!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mock Draft Preview */}
      <section className="w-full max-w-5xl mx-auto px-4 py-20 opacity-80 pointer-events-none select-none">
        <div className="bg-surface-900 rounded-3xl border border-surface-700 p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600"></div>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-black">Draft de Futebol</h3>
              <p className="text-surface-400">Rodada 2 • Sua vez</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-primary-400">00:14</div>
              <p className="text-surface-400 text-sm uppercase font-bold">Tempo restante</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[3/4] bg-surface-800 rounded-xl border border-surface-700 flex flex-col p-4 animate-pulse">
                <div className="w-full h-1/2 bg-surface-700 rounded-lg mb-4"></div>
                <div className="w-3/4 h-4 bg-surface-600 rounded mb-2"></div>
                <div className="w-1/2 h-4 bg-surface-600 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
