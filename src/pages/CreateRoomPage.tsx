import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { validatePlayerName } from '@/utils/validators';
import type { DraftSettings, DraftCategory, DraftMode, TimeLimitSeconds, PicksPerPlayer } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function CreateRoomPage() {
  const navigate = useNavigate();
  const { actions } = useGame();

  const [name, setName] = useState('');
  const [settings, setSettings] = useState<DraftSettings>({
    category: 'football',
    maxPlayers: 4,
    timeLimit: 30,
    picksPerPlayer: 5,
    mode: 'snake',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const validation = validatePlayerName(name);
    if (!validation.valid) {
      setError(validation.error || 'Nome inválido.');
      return;
    }

    setLoading(true);
    try {
      const newRoom = await actions.createRoom(name.trim(), settings);
      navigate(`/room/${newRoom.code}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao criar sala. Tente novamente.';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-12">
      <Card className="p-8">
        <h1 className="text-3xl font-black mb-6 text-center">Criar Sala</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-bold text-surface-300">
              Seu nome
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-900 border border-surface-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              placeholder="Digite seu nickname"
              required
              minLength={2}
              maxLength={20}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-bold text-surface-300">
              Tipo de draft
            </label>
            <select
              id="category"
              value={settings.category}
              onChange={(e) => setSettings({ ...settings, category: e.target.value as DraftCategory })}
              className="w-full bg-surface-900 border border-surface-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
            >
              <option value="football">⚽ Futebol</option>
              <option value="nba">🏀 NBA</option>
              <option value="games">🎮 Games</option>
              <option value="characters">🦸 Personagens</option>
              <option value="custom">🛠️ Personalizado</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="maxPlayers" className="block text-sm font-bold text-surface-300">
                Jogadores
              </label>
              <select
                id="maxPlayers"
                value={settings.maxPlayers}
                onChange={(e) => setSettings({ ...settings, maxPlayers: Number(e.target.value) })}
                className="w-full bg-surface-900 border border-surface-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
              >
                {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n} jogadores
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="picksPerPlayer" className="block text-sm font-bold text-surface-300">
                Escolhas por jogador
              </label>
              <select
                id="picksPerPlayer"
                value={settings.picksPerPlayer}
                onChange={(e) =>
                  setSettings({ ...settings, picksPerPlayer: Number(e.target.value) as PicksPerPlayer })
                }
                className="w-full bg-surface-900 border border-surface-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
              >
                <option value={3}>3 escolhas</option>
                <option value={5}>5 escolhas</option>
                <option value={7}>7 escolhas</option>
                <option value={10}>10 escolhas</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="timeLimit" className="block text-sm font-bold text-surface-300">
                Tempo por escolha
              </label>
              <select
                id="timeLimit"
                value={settings.timeLimit}
                onChange={(e) =>
                  setSettings({ ...settings, timeLimit: Number(e.target.value) as TimeLimitSeconds })
                }
                className="w-full bg-surface-900 border border-surface-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
              >
                <option value={0}>Sem limite</option>
                <option value={15}>15 segundos</option>
                <option value={30}>30 segundos</option>
                <option value={45}>45 segundos</option>
                <option value={60}>60 segundos</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="mode" className="block text-sm font-bold text-surface-300">
                Modo
              </label>
              <select
                id="mode"
                value={settings.mode}
                onChange={(e) => setSettings({ ...settings, mode: e.target.value as DraftMode })}
                className="w-full bg-surface-900 border border-surface-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
              >
                <option value="classic">Draft Clássico</option>
                <option value="snake">Snake Draft</option>
              </select>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            loading={loading}
            className="mt-4"
          >
            CRIAR SALA
          </Button>
        </form>
      </Card>
    </div>
  );
}
