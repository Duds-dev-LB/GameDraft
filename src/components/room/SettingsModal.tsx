import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useGame } from '@/context/GameContext';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { DraftSettings, DraftCategory, DraftMode, TimeLimitSeconds, PicksPerPlayer } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: FC<Props> = ({ isOpen, onClose }) => {
  const { room, actions } = useGame();
  const { addToast } = useToast();

  const [settings, setSettings] = useState<DraftSettings>({
    category: 'football',
    mode: 'snake',
    maxPlayers: 4,
    timeLimit: 30,
    picksPerPlayer: 5,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (room?.settings) {
      setSettings(room.settings);
    }
  }, [room?.settings, isOpen]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await actions.updateSettings(settings);
      addToast('success', 'Configurações atualizadas com sucesso!');
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar configurações.';
      addToast('error', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configurações da Sala">
      <div className="space-y-4 py-2">
        <div>
          <label htmlFor="settings-category" className="block text-sm font-bold text-surface-300 mb-1">
            Tipo de draft
          </label>
          <select
            id="settings-category"
            value={settings.category}
            onChange={(e) => setSettings({ ...settings, category: e.target.value as DraftCategory })}
            className="w-full bg-surface-900 border border-surface-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-primary-500"
          >
            <option value="football">⚽ Futebol</option>
            <option value="nba">🏀 NBA</option>
            <option value="games">🎮 Games</option>
            <option value="characters">🦸 Personagens</option>
            <option value="custom">🛠️ Personalizado</option>
          </select>
        </div>

        <div>
          <label htmlFor="settings-mode" className="block text-sm font-bold text-surface-300 mb-1">
            Modo de Turno
          </label>
          <select
            id="settings-mode"
            value={settings.mode}
            onChange={(e) => setSettings({ ...settings, mode: e.target.value as DraftMode })}
            className="w-full bg-surface-900 border border-surface-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-primary-500"
          >
            <option value="snake">Snake Draft (A → B → C → C → B → A)</option>
            <option value="classic">Clássico (A → B → C → A → B → C)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="settings-players" className="block text-sm font-bold text-surface-300 mb-1">
              Máx. Jogadores
            </label>
            <select
              id="settings-players"
              value={settings.maxPlayers}
              onChange={(e) => setSettings({ ...settings, maxPlayers: Number(e.target.value) })}
              className="w-full bg-surface-900 border border-surface-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-primary-500"
            >
              {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n} jogadores
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="settings-picks" className="block text-sm font-bold text-surface-300 mb-1">
              Escolhas/Jogador
            </label>
            <select
              id="settings-picks"
              value={settings.picksPerPlayer}
              onChange={(e) =>
                setSettings({ ...settings, picksPerPlayer: Number(e.target.value) as PicksPerPlayer })
              }
              className="w-full bg-surface-900 border border-surface-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-primary-500"
            >
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={7}>7</option>
              <option value={10}>10</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="settings-timelimit" className="block text-sm font-bold text-surface-300 mb-1">
            Tempo por Escolha
          </label>
          <select
            id="settings-timelimit"
            value={settings.timeLimit}
            onChange={(e) =>
              setSettings({ ...settings, timeLimit: Number(e.target.value) as TimeLimitSeconds })
            }
            className="w-full bg-surface-900 border border-surface-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-primary-500"
          >
            <option value={0}>Sem limite</option>
            <option value={15}>15 segundos</option>
            <option value={30}>30 segundos</option>
            <option value={45}>45 segundos</option>
            <option value={60}>60 segundos</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-surface-800">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>
            Salvar Alterações
          </Button>
        </div>
      </div>
    </Modal>
  );
};
