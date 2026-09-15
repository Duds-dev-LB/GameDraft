import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { validatePlayerName, validateRoomCode } from '@/utils/validators';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function JoinRoomPage() {
  const { code } = useParams<{ code?: string }>();
  const navigate = useNavigate();
  const { actions } = useGame();

  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState(code || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (code) {
      setRoomCode(code.toUpperCase());
    }
  }, [code]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const nameValidation = validatePlayerName(name);
    if (!nameValidation.valid) {
      setError(nameValidation.error || 'Nome inválido.');
      return;
    }

    const formattedCode = roomCode.trim().toUpperCase();
    const codeValidation = validateRoomCode(formattedCode);
    if (!codeValidation.valid) {
      setError(codeValidation.error || 'Código de sala inválido.');
      return;
    }

    setLoading(true);
    try {
      await actions.joinRoom(formattedCode, name.trim());
      navigate(`/room/${formattedCode}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Erro ao entrar na sala. Verifique o código e tente novamente.';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-12">
      <Card className="p-8">
        <h1 className="text-3xl font-black mb-6 text-center">Entrar em uma Sala</h1>

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
              className="w-full bg-surface-900 border border-surface-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
              placeholder="Digite seu nickname"
              required
              minLength={2}
              maxLength={20}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="roomCode" className="block text-sm font-bold text-surface-300">
              Código da sala
            </label>
            <input
              id="roomCode"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full bg-surface-900 border border-surface-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors uppercase font-mono tracking-widest"
              placeholder="EX: A1B2C3"
              required
              maxLength={6}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            loading={loading}
            className="mt-4"
          >
            ENTRAR
          </Button>
        </form>
      </Card>
    </div>
  );
}
