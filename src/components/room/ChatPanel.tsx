import { useState, useRef, useEffect } from 'react';
import type { FC, FormEvent } from 'react';
import type { ChatMessage } from '@/types';
import { Button } from '@/components/ui/Button';
import { getAvatarColor } from '@/utils/avatar';

interface Props {
  messages: ChatMessage[];
  onSend: (msg: string) => Promise<void>;
}

export const ChatPanel: FC<Props> = ({ messages, onSend }) => {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      await onSend(trimmed);
      setInput('');
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-900/60">
      <div className="p-4 border-b border-surface-800 flex items-center justify-between shrink-0">
        <h3 className="font-bold text-surface-200 text-sm flex items-center gap-2">
          <span>💬 Chat da Sala</span>
          <span className="text-xs text-surface-400 font-normal">
            ({messages.length})
          </span>
        </h3>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[200px]">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-surface-500 text-sm">
            Nenhuma mensagem ainda. Diga oi para a galera! 👋
          </div>
        ) : (
          messages.map((msg) => {
            const color = getAvatarColor(msg.playerId);
            const time = new Date(msg.sentAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div key={msg.id} className="text-sm leading-relaxed">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-bold text-xs" style={{ color }}>
                    {msg.playerName}:
                  </span>
                  <span className="text-xs text-surface-500">{time}</span>
                </div>
                <p className="text-surface-200 break-words mt-0.5">{msg.message}</p>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-surface-900 border-t border-surface-800 flex gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite uma mensagem..."
          maxLength={500}
          className="flex-1 bg-surface-950 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!input.trim()}
          loading={sending}
          className="px-4"
        >
          Enviar
        </Button>
      </form>
    </div>
  );
};
