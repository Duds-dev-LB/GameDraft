import { useState, useMemo, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import { useGame } from '@/context/GameContext';
import { useToast } from '@/context/ToastContext';
import { useTimer } from '@/hooks/useTimer';
import { useSound } from '@/hooks/useSound';
import { TurnIndicator } from './TurnIndicator';
import { DraftCard } from './DraftCard';
import { TeamPanel } from './TeamPanel';
import { DraftHistory } from './DraftHistory';
import { getCurrentPlayerIndex, getCurrentRound } from '@/utils/draft-engine';
import { getGameService } from '@/services/game-service';

export const DraftView: FC = () => {
  const { room, players, options, picks, currentPlayer, actions } = useGame();
  const { addToast } = useToast();
  const { playPick, playTurn, playWarning } = useSound();

  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileTab, setMobileTab] = useState<'cards' | 'team' | 'history'>('cards');

  const sortedPlayers = useMemo(
    () => [...players].sort((a, b) => a.draftOrder - b.draftOrder),
    [players]
  );

  const activePlayerIndex = useMemo(() => {
    if (!room || sortedPlayers.length === 0) return 0;
    return getCurrentPlayerIndex(room.currentTurn, sortedPlayers.length, room.settings.mode);
  }, [room, sortedPlayers.length]);

  const turnPlayer = sortedPlayers[activePlayerIndex] || null;
  const isMyTurn = turnPlayer ? turnPlayer.id === currentPlayer?.id : false;

  // Sound cue when it becomes user's turn
  useEffect(() => {
    if (isMyTurn) {
      playTurn();
      addToast('info', 'É a sua vez de escolher!');
    }
  }, [isMyTurn, playTurn, addToast]);

  // Handle timeout
  const handleTimeout = useCallback(() => {
    if (room && isMyTurn) {
      const service = getGameService();
      service.skipTurn(room.id, currentPlayer!.id).catch(() => {});
      addToast('warning', 'Seu tempo acabou! Turno pulado.');
    }
  }, [room, isMyTurn, currentPlayer, addToast]);

  const timeLimit = room?.settings.timeLimit || 0;
  const { timeRemaining, isWarning } = useTimer(
    room?.turnStartedAt || null,
    timeLimit,
    handleTimeout
  );

  useEffect(() => {
    if (isWarning && isMyTurn) {
      playWarning();
    }
  }, [isWarning, isMyTurn, playWarning]);

  const totalPicks = (room?.settings.picksPerPlayer || 5) * (sortedPlayers.length || 1);
  const currentPickNumber = Math.min((room?.currentTurn || 0) + 1, totalPicks);
  const currentRound = getCurrentRound(room?.currentTurn || 0, sortedPlayers.length || 1);

  // Set of picked option IDs
  const pickedMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of picks) {
      const player = players.find((x) => x.id === p.playerId);
      map.set(p.optionId, player?.name || 'Alguém');
    }
    return map;
  }, [picks, players]);

  // My picks with option details
  const myPicks = useMemo(() => {
    if (!currentPlayer) return [];
    return picks
      .filter((p) => p.playerId === currentPlayer.id)
      .map((p) => ({
        ...p,
        option: options.find((o) => o.id === p.optionId) || {
          id: p.optionId,
          roomId: room?.id || '',
          name: 'Opção',
          imageUrl: '',
          description: '',
          category: '',
          rating: 50,
          tags: [],
          metadata: {},
        },
      }));
  }, [picks, currentPlayer, options, room?.id]);

  // Opponent stats
  const opponents = useMemo(() => {
    if (!currentPlayer) return [];
    return sortedPlayers
      .filter((p) => p.id !== currentPlayer.id)
      .map((p) => ({
        player: p,
        pickCount: picks.filter((pick) => pick.playerId === p.id).length,
      }));
  }, [sortedPlayers, currentPlayer, picks]);

  // Filter options by search
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter(
      (o) =>
        o.name.toLowerCase().includes(query) ||
        o.description.toLowerCase().includes(query) ||
        o.tags.some((t) => t.toLowerCase().includes(query))
    );
  }, [options, searchQuery]);

  const handlePickOption = async (optionId: string) => {
    if (!isMyTurn || selectingId) return;

    setSelectingId(optionId);
    playPick();

    try {
      await actions.makePick(optionId);
      addToast('success', 'Escolha registrada!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao realizar escolha.';
      addToast('error', message);
    } finally {
      setSelectingId(null);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] max-w-7xl mx-auto w-full px-2 sm:px-4 py-2 overflow-hidden">
      {/* Turn Indicator Banner */}
      <div className="shrink-0 mb-3">
        <TurnIndicator
          currentPlayerName={turnPlayer?.name || 'Carregando...'}
          isMyTurn={isMyTurn}
          currentPick={currentPickNumber}
          totalPicks={totalPicks}
          timeRemaining={timeRemaining}
          timeLimit={timeLimit}
        />
      </div>

      {/* Mobile Navigation Tabs */}
      <div className="flex md:hidden bg-surface-900 rounded-xl p-1 mb-2 border border-surface-800 shrink-0">
        <button
          onClick={() => setMobileTab('cards')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            mobileTab === 'cards'
              ? 'bg-primary-600 text-white shadow'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          Cartas ({options.length - pickedMap.size})
        </button>
        <button
          onClick={() => setMobileTab('team')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            mobileTab === 'team'
              ? 'bg-primary-600 text-white shadow'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          Meu Time ({myPicks.length})
        </button>
        <button
          onClick={() => setMobileTab('history')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            mobileTab === 'history'
              ? 'bg-primary-600 text-white shadow'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          Histórico ({picks.length})
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
        {/* Center: Cards Grid (Visible on Desktop OR when mobileTab === 'cards') */}
        <div
          className={`flex-1 flex flex-col bg-surface-900/40 rounded-2xl border border-surface-800/80 p-3 sm:p-4 overflow-hidden ${
            mobileTab !== 'cards' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header controls: Search and Stats */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-surface-300">
                Rodada {currentRound} de {room?.settings.picksPerPlayer || 5}
              </span>
              <span className="text-xs text-surface-500">•</span>
              <span className="text-xs text-surface-400 font-mono">
                {options.length - pickedMap.size} disponíveis
              </span>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Buscar opção..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-950 border border-surface-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-primary-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredOptions.map((opt) => {
                const pickedByName = pickedMap.get(opt.id);
                const isPicked = !!pickedByName;

                return (
                  <DraftCard
                    key={opt.id}
                    option={opt}
                    isPicked={isPicked}
                    pickedByName={pickedByName}
                    canPick={isMyTurn && !isPicked}
                    onPick={handlePickOption}
                    isSelecting={selectingId === opt.id}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Team & History (Desktop OR when selected on Mobile) */}
        <div
          className={`w-full md:w-80 lg:w-96 flex-col gap-3 shrink-0 ${
            mobileTab === 'cards' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Team Panel */}
          <div
            className={`bg-surface-900/60 rounded-2xl border border-surface-800 overflow-hidden ${
              mobileTab === 'team' ? 'flex-1 flex' : mobileTab === 'history' ? 'hidden' : 'flex-1'
            }`}
          >
            <div className="h-full overflow-y-auto w-full">
              <TeamPanel myPicks={myPicks} opponents={opponents} />
            </div>
          </div>

          {/* History Panel */}
          <div
            className={`bg-surface-900/60 rounded-2xl border border-surface-800 overflow-hidden ${
              mobileTab === 'history' ? 'flex-1 flex' : mobileTab === 'team' ? 'hidden' : 'h-64'
            }`}
          >
            <div className="h-full overflow-y-auto w-full">
              <DraftHistory picks={picks} players={players} options={options} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
