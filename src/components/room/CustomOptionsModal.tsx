import { useState } from 'react';
import type { FC } from 'react';
import { useGame } from '@/context/GameContext';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface CustomItem {
  name: string;
  description: string;
}

export const CustomOptionsModal: FC<Props> = ({ isOpen, onClose }) => {
  const { actions } = useGame();
  const { addToast } = useToast();

  const [items, setItems] = useState<CustomItem[]>([
    { name: '', description: '' },
    { name: '', description: '' },
    { name: '', description: '' },
    { name: '', description: '' },
    { name: '', description: '' },
  ]);
  const [saving, setSaving] = useState(false);

  const handleAddRow = () => {
    setItems([...items, { name: '', description: '' }]);
  };

  const handleRemoveRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof CustomItem, value: string) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const validCount = items.filter((it) => it.name.trim().length > 0).length;

  const handleSave = async () => {
    const validItems = items
      .filter((it) => it.name.trim().length > 0)
      .map((it) => ({
        name: it.name.trim(),
        description: it.description.trim() || undefined,
      }));

    if (validItems.length < 5) {
      addToast('warning', 'Adicione pelo menos 5 opções válidas.');
      return;
    }

    setSaving(true);
    try {
      await actions.addCustomOptions(validItems);
      addToast('success', `${validItems.length} opções adicionadas com sucesso!`);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao adicionar opções.';
      addToast('error', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Opções Customizadas" maxWidth="max-w-2xl">
      <div className="space-y-4 py-2">
        <p className="text-sm text-surface-400">
          Cadastre as opções que estarão disponíveis para escolha no draft.
        </p>

        <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1">
          {items.map((it, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <span className="text-xs text-surface-500 font-mono w-6 text-right">
                {idx + 1}.
              </span>
              <input
                type="text"
                placeholder="Nome da opção (ex: Goku, Pizza, Kratos)"
                value={it.name}
                onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                className="flex-1 bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
              />
              <input
                type="text"
                placeholder="Descrição (opcional)"
                value={it.description}
                onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                className="flex-1 bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveRow(idx)}
                  className="text-surface-500 hover:text-danger-400 p-2 text-lg transition-colors"
                  title="Remover linha"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-2">
          <Button variant="ghost" size="sm" onClick={handleAddRow}>
            + Adicionar Linha
          </Button>
          <span className="text-xs text-surface-400">
            {validCount} opções preenchidas
          </span>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-surface-800">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={saving}
            disabled={validCount < 5}
          >
            Salvar Opções
          </Button>
        </div>
      </div>
    </Modal>
  );
};
