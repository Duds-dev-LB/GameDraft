import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { useGame } from '@/context/GameContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SettingsModal } from './SettingsModal';
import { CustomOptionsModal } from './CustomOptionsModal';
import { ChatPanel } from './ChatPanel';

export const LobbyView: FC = () => {
  const { room, players, messages, isHost, currentPlayer, options, actions } = useGame();
  const { addToast } = useToast();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCustomOptionsOpen, setIsCustomOptionsOpen] = useState(false);
  const [isConfirmLeaveOpen, setIsConfirmLeaveOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const roomCode = room?.code || '';
  const canStart = players.length >= 2;

  const categoryLabels: Record<string, string> = {
    football: '⚽ Futebol',
    nba: '🏀 NBA',
    games: '🎮 Games',
    characters: '🦸 Personagens',
    custom: '🛠️ Personalizado',
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GameDraft — Sala de Jogo',
          text: `Venha jogar GameDraft comigo! Código da sala: ${roomCode}`,
          url: `${window.location.origin}/join/${roomCode}`,
        });
      } catch {
        // user cancelled share
      }
    } else {
      await navigator.clipboard.writeText(`${window.location.origin}/join/${roomCode}`);
      addToast('info', 'Link copiado para a área de transferência!');
    }
  };

  const handleStartDraft = async () => {
    if (!canStart) {
      addToast('warning', 'São necessários pelo menos 2 jogadores para iniciar.');
      return;
    }

    if (room?.settings.category === 'custom' && options.length < (room.settings.picksPerPlayer * players.length)) {
      addToast(
        'warning',
        `Opções customizadas insuficientes! Adicione pelo menos ${room.settings.picksPerPlayer * players.length} opções.`
      );
      setIsCustomOptionsOpen(true);
      return;
    }

    setIsStarting(true);
    try {
      await actions.startDraft();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao iniciar o draft.';
      addToast('error', message);
      setIsStarting(false);
    }
  };

  const handleKick = async (playerId: string, playerName: string) => {
    try {
      await actions.kickPlayer(playerId);
      addToast('info', `${playerName} foi removido da sala.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao remover jogador.';
      addToast('error', message);
    }
  };

  const sortedPlayers = useMemo(
    () => [...players].sort((a, b) => (b.isHost ? 1 : 0) - (a.isHost ? 1 : 0)),
    [players]
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-8 min-h-[calc(100vh-140px)] w-full max-w-7xl mx-auto">
      {/* Left Column: Room info, players, controls */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Room Header Card */}
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-bold text-surface-400 uppercase tracking-widest block mb-1">
                Sua Sala
              </span>
              <div className="flex items-center gap-3">
                <span className="text-4xl md:text-5xl font-mono font-black text-primary-400 tracking-wider">
                  {roomCode}
                </span>
                <CopyButton text={roomCode} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={handleShare} variant="secondary" size="md">
                <span className="mr-1.5">🔗</span> Compartilhar
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={() => setIsConfirmLeaveOpen(true)}
              >
                Sair
              </Button>
            </div>
          </div>

          {/* Settings Badges */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-surface-700/50">
            <Badge variant="primary">
              {categoryLabels[room?.settings.category || 'football']}
            </Badge>
            <Badge variant="default">
              {room?.settings.mode === 'snake' ? '🐍 Snake Draft' : '🔄 Clássico'}
            </Badge>
            <Badge variant="default">
              ⏱️ {room?.settings.timeLimit ? `${room.settings.timeLimit}s por turno` : 'Sem tempo'}
            </Badge>
            <Badge variant="default">
              🎯 {room?.settings.picksPerPlayer} escolhas/jogador
            </Badge>
            <Badge variant="default">
              👥 Máx {room?.settings.maxPlayers} jogadores
            </Badge>
          </div>
        </Card>

        {/* Players List Card */}
        <Card className="p-6 flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>Jogadores na Sala</span>
              <span className="text-sm font-normal text-surface-400">
                ({players.length}/{room?.settings.maxPlayers || 8})
              </span>
            </h2>
            {isHost && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSettingsOpen(true)}
                className="text-surface-300"
              >
                ⚙️ Configurações
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sortedPlayers.map((p) => {
              const isMe = p.id === currentPlayer?.id;
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    isMe
                      ? 'bg-primary-950/40 border-primary-500/40 shadow-sm'
                      : 'bg-surface-900 border-surface-800'
                  }`}
                >
                  <Avatar name={p.name} seed={p.avatarSeed} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white truncate">{p.name}</span>
                      {isMe && <span className="text-xs text-primary-400 font-medium">(Você)</span>}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-surface-400">
                      <span>{p.isConnected ? '🟢 Conectado' : '🔴 Desconectado'}</span>
                      {p.isHost && <Badge variant="warning" size="sm">Host</Badge>}
                    </div>
                  </div>

                  {isHost && !p.isHost && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleKick(p.id, p.name)}
                      className="text-danger-400 hover:text-danger-300 text-xs px-2"
                      title="Remover jogador"
                    >
                      ✕
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {players.length < 2 && (
            <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm text-center">
              ⚠️ Convide pelo menos mais 1 amigo com o código <strong>{roomCode}</strong> para iniciar a partida.
            </div>
          )}

          {/* Custom options prompt */}
          {room?.settings.category === 'custom' && (
            <div className="mt-4 p-4 rounded-xl bg-surface-900 border border-surface-700/50 flex items-center justify-between">
              <div>
                <span className="font-bold text-sm block">Opções Customizadas</span>
                <span className="text-xs text-surface-400">
                  {options.length} opções cadastradas
                </span>
              </div>
              {isHost && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCustomOptionsOpen(true)}
                >
                  Editar Opções
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* Start Game Footer / Status */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {isHost ? (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={!canStart}
              loading={isStarting}
              onClick={handleStartDraft}
              className="py-4 font-bold text-lg shadow-lg shadow-primary-600/30"
            >
              🚀 INICIAR DRAFT ({players.length} jogadores)
            </Button>
          ) : (
            <div className="w-full p-4 rounded-xl bg-surface-900 border border-surface-800 text-center text-surface-300 font-medium">
              ⏳ Aguardando o host iniciar a partida...
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Chat Panel */}
      <div className="w-full lg:w-96 flex flex-col h-[480px] lg:h-auto">
        <Card className="h-full flex flex-col overflow-hidden">
          <ChatPanel
            messages={messages}
            onSend={async (msg) => {
              await actions.sendChatMessage(msg);
            }}
          />
        </Card>
      </div>

      {/* Modals */}
      {isHost && (
        <>
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
          <CustomOptionsModal
            isOpen={isCustomOptionsOpen}
            onClose={() => setIsCustomOptionsOpen(false)}
          />
        </>
      )}

      <ConfirmDialog
        isOpen={isConfirmLeaveOpen}
        title="Sair da sala"
        message="Tem certeza que deseja sair desta sala? Se você for o host, outro jogador assumirá a liderança."
        confirmText="Sim, sair"
        variant="danger"
        onConfirm={() => {
          setIsConfirmLeaveOpen(false);
          actions.leaveRoom();
        }}
        onCancel={() => setIsConfirmLeaveOpen(false)}
      />
    </div>
  );
};
