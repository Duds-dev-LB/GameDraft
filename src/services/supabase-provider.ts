import type { GameService } from './types';
import type { RoomCallbacks } from './types';
import type {
  Room,
  Player,
  DraftOption,
  Pick,
  ChatMessage,
  DraftSettings,
  CustomOptionInput,
} from '@/types';
import { supabase } from '@/lib/supabase';
import { generateRoomCode } from '@/utils/room-code';
import { getOptionsForCategory } from '@/data';
import { getCurrentPlayerIndex, isDraftFinished, getCurrentRound } from '@/utils/draft-engine';

// ============================================================
// SupabaseProvider — Real Supabase backend
// ============================================================

function getClient() {
  if (!supabase) throw new Error('Supabase não está configurado.');
  return supabase;
}

function mapRoom(row: Record<string, unknown>): Room {
  return {
    id: row.id as string,
    code: row.code as string,
    hostId: row.host_id as string,
    status: row.status as Room['status'],
    settings: row.settings as DraftSettings,
    currentTurn: row.current_turn as number,
    turnStartedAt: row.turn_started_at as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapPlayer(row: Record<string, unknown>): Player {
  return {
    id: row.id as string,
    roomId: row.room_id as string,
    name: row.name as string,
    avatarSeed: row.avatar_seed as string,
    isHost: row.is_host as boolean,
    isConnected: row.is_connected as boolean,
    draftOrder: row.draft_order as number,
    joinedAt: row.joined_at as string,
  };
}

function mapOption(row: Record<string, unknown>): DraftOption {
  return {
    id: row.id as string,
    roomId: row.room_id as string,
    name: row.name as string,
    imageUrl: row.image_url as string,
    description: row.description as string,
    category: row.category as string,
    rating: row.rating as number,
    tags: (row.tags as string[]) || [],
    metadata: (row.metadata as Record<string, unknown>) || {},
  };
}

function mapPick(row: Record<string, unknown>): Pick {
  return {
    id: row.id as string,
    roomId: row.room_id as string,
    playerId: row.player_id as string,
    optionId: row.option_id as string,
    roundNumber: row.round_number as number,
    turnNumber: row.turn_number as number,
    pickedAt: row.picked_at as string,
    isTimeout: row.is_timeout as boolean,
  };
}

function mapMessage(row: Record<string, unknown>): ChatMessage {
  return {
    id: row.id as string,
    roomId: row.room_id as string,
    playerId: row.player_id as string,
    playerName: row.player_name as string,
    message: row.message as string,
    sentAt: row.sent_at as string,
  };
}

export class SupabaseProvider implements GameService {
  async createRoom(hostName: string, hostId: string, settings: DraftSettings): Promise<Room> {
    const client = getClient();

    let code = generateRoomCode();
    // Ensure unique code
    for (let i = 0; i < 5; i++) {
      const { data: existing } = await client.from('rooms').select('id').eq('code', code).maybeSingle();
      if (!existing) break;
      code = generateRoomCode();
    }

    const roomId = crypto.randomUUID();

    const { error: roomError } = await client.from('rooms').insert({
      id: roomId,
      code,
      host_id: hostId,
      status: 'lobby',
      settings,
      current_turn: 0,
      turn_started_at: null,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    if (roomError) throw new Error('Erro ao criar sala: ' + roomError.message);

    const { error: playerError } = await client.from('players').insert({
      id: hostId,
      room_id: roomId,
      name: hostName,
      avatar_seed: hostId.slice(0, 8),
      is_host: true,
      is_connected: true,
      draft_order: 0,
    });

    if (playerError) throw new Error('Erro ao registrar jogador: ' + playerError.message);

    // Insert default options
    const templates = getOptionsForCategory(settings.category);
    if (templates.length > 0) {
      const optionRows = templates.map((t) => ({
        id: crypto.randomUUID(),
        room_id: roomId,
        name: t.name,
        image_url: t.imageUrl,
        description: t.description,
        category: t.category,
        rating: t.rating,
        tags: t.tags,
        metadata: {},
      }));

      await client.from('draft_options').insert(optionRows);
    }

    const { data: room } = await client.from('rooms').select('*').eq('id', roomId).single();
    return mapRoom(room!);
  }

  async joinRoom(code: string, playerName: string, playerId: string): Promise<{ room: Room; players: Player[] }> {
    const client = getClient();

    const { data: roomRow } = await client.from('rooms').select('*').eq('code', code.toUpperCase()).maybeSingle();
    if (!roomRow) throw new Error('Sala não encontrada. Verifique o código e tente novamente.');

    const room = mapRoom(roomRow);

    if (room.status === 'closed') throw new Error('Esta sala foi encerrada.');
    if (room.status === 'finished') throw new Error('Esta partida já foi finalizada.');

    // Check for reconnection
    const { data: existingPlayer } = await client
      .from('players')
      .select('*')
      .eq('room_id', room.id)
      .eq('id', playerId)
      .maybeSingle();

    if (existingPlayer) {
      await client.from('players').update({ is_connected: true, name: playerName }).eq('id', playerId);
    } else {
      const { data: allPlayers } = await client.from('players').select('*').eq('room_id', room.id);
      const currentCount = allPlayers?.length || 0;

      if (currentCount >= room.settings.maxPlayers) throw new Error('Esta sala está cheia.');
      if (room.status === 'drafting') throw new Error('O draft já começou nesta sala.');

      await client.from('players').insert({
        id: playerId,
        room_id: room.id,
        name: playerName,
        avatar_seed: playerId.slice(0, 8),
        is_host: false,
        is_connected: true,
        draft_order: currentCount,
      });
    }

    const { data: players } = await client.from('players').select('*').eq('room_id', room.id).order('draft_order');
    return { room, players: (players || []).map(mapPlayer) };
  }

  async leaveRoom(roomId: string, playerId: string): Promise<void> {
    const client = getClient();

    const { data: room } = await client.from('rooms').select('*').eq('id', roomId).single();
    if (!room) return;

    if (room.status === 'lobby') {
      await client.from('players').delete().eq('id', playerId).eq('room_id', roomId);
    } else {
      await client.from('players').update({ is_connected: false }).eq('id', playerId).eq('room_id', roomId);
    }

    // Transfer host if needed
    if (room.host_id === playerId) {
      const { data: remaining } = await client
        .from('players')
        .select('*')
        .eq('room_id', roomId)
        .eq('is_connected', true)
        .neq('id', playerId)
        .limit(1);

      if (remaining && remaining.length > 0) {
        await client.from('rooms').update({ host_id: remaining[0].id }).eq('id', roomId);
        await client.from('players').update({ is_host: true }).eq('id', remaining[0].id);
        await client.from('players').update({ is_host: false }).eq('id', playerId);
      } else {
        await client.from('rooms').update({ status: 'closed' }).eq('id', roomId);
      }
    }
  }

  async getRoom(code: string): Promise<Room | null> {
    const client = getClient();
    const { data } = await client.from('rooms').select('*').eq('code', code.toUpperCase()).maybeSingle();
    return data ? mapRoom(data) : null;
  }

  async getRoomData(roomId: string) {
    const client = getClient();
    const [roomRes, playersRes, optionsRes, picksRes, messagesRes] = await Promise.all([
      client.from('rooms').select('*').eq('id', roomId).single(),
      client.from('players').select('*').eq('room_id', roomId).order('draft_order'),
      client.from('draft_options').select('*').eq('room_id', roomId),
      client.from('picks').select('*').eq('room_id', roomId).order('turn_number'),
      client.from('chat_messages').select('*').eq('room_id', roomId).order('sent_at'),
    ]);

    return {
      room: mapRoom(roomRes.data!),
      players: (playersRes.data || []).map(mapPlayer),
      options: (optionsRes.data || []).map(mapOption),
      picks: (picksRes.data || []).map(mapPick),
      messages: (messagesRes.data || []).map(mapMessage),
    };
  }

  async startDraft(roomId: string, playerId: string): Promise<void> {
    const client = getClient();
    const { data: room } = await client.from('rooms').select('*').eq('id', roomId).single();
    if (!room) throw new Error('Sala não encontrada.');
    if (room.host_id !== playerId) throw new Error('Apenas o host pode iniciar o draft.');

    const { data: players } = await client.from('players').select('*').eq('room_id', roomId);
    if (!players || players.length < 2) throw new Error('São necessários pelo menos 2 jogadores para iniciar.');

    // Shuffle order
    const shuffled = players.sort(() => Math.random() - 0.5);
    for (let i = 0; i < shuffled.length; i++) {
      await client.from('players').update({ draft_order: i }).eq('id', shuffled[i].id);
    }

    const timeLimit = (room.settings as DraftSettings).timeLimit;
    await client.from('rooms').update({
      status: 'drafting',
      current_turn: 0,
      turn_started_at: timeLimit > 0 ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }).eq('id', roomId);
  }

  async updateRoomSettings(roomId: string, playerId: string, settings: DraftSettings): Promise<void> {
    const client = getClient();
    const { data: room } = await client.from('rooms').select('*').eq('id', roomId).single();
    if (!room || room.host_id !== playerId) throw new Error('Apenas o host pode alterar configurações.');

    await client.from('rooms').update({ settings, updated_at: new Date().toISOString() }).eq('id', roomId);

    // Reload options
    await client.from('draft_options').delete().eq('room_id', roomId);
    const templates = getOptionsForCategory(settings.category);
    if (templates.length > 0) {
      const optionRows = templates.map((t) => ({
        id: crypto.randomUUID(),
        room_id: roomId,
        name: t.name,
        image_url: t.imageUrl,
        description: t.description,
        category: t.category,
        rating: t.rating,
        tags: t.tags,
        metadata: {},
      }));
      await client.from('draft_options').insert(optionRows);
    }
  }

  async kickPlayer(roomId: string, hostId: string, targetPlayerId: string): Promise<void> {
    const client = getClient();
    const { data: room } = await client.from('rooms').select('*').eq('id', roomId).single();
    if (!room || room.host_id !== hostId) throw new Error('Apenas o host pode remover jogadores.');
    await client.from('players').delete().eq('id', targetPlayerId).eq('room_id', roomId);
  }

  async transferHost(roomId: string, currentHostId: string, newHostId: string): Promise<void> {
    const client = getClient();
    await client.from('players').update({ is_host: false }).eq('id', currentHostId);
    await client.from('players').update({ is_host: true }).eq('id', newHostId);
    await client.from('rooms').update({ host_id: newHostId }).eq('id', roomId);
  }

  async makePick(roomId: string, playerId: string, optionId: string): Promise<Pick> {
    const client = getClient();

    const { data: room } = await client.from('rooms').select('*').eq('id', roomId).single();
    if (!room || room.status !== 'drafting') throw new Error('O draft não está em andamento.');

    const settings = room.settings as DraftSettings;
    const { data: players } = await client.from('players').select('*').eq('room_id', roomId).order('draft_order');
    if (!players) throw new Error('Erro ao carregar jogadores.');

    const expectedIndex = getCurrentPlayerIndex(room.current_turn, players.length, settings.mode);
    if (players[expectedIndex].id !== playerId) throw new Error('Não é sua vez de escolher.');

    // Check duplicate
    const { data: existingPick } = await client.from('picks').select('id').eq('room_id', roomId).eq('option_id', optionId).maybeSingle();
    if (existingPick) throw new Error('Esta opção já foi escolhida.');

    const pickId = crypto.randomUUID();
    const roundNumber = getCurrentRound(room.current_turn, players.length);
    const newTurn = room.current_turn + 1;
    const finished = isDraftFinished(newTurn, players.length, settings.picksPerPlayer);

    const { error: pickError } = await client.from('picks').insert({
      id: pickId,
      room_id: roomId,
      player_id: playerId,
      option_id: optionId,
      round_number: roundNumber,
      turn_number: room.current_turn,
      picked_at: new Date().toISOString(),
      is_timeout: false,
    });

    if (pickError) throw new Error('Erro ao registrar escolha.');

    await client.from('rooms').update({
      current_turn: newTurn,
      status: finished ? 'finished' : 'drafting',
      turn_started_at: finished ? null : (settings.timeLimit > 0 ? new Date().toISOString() : null),
      updated_at: new Date().toISOString(),
    }).eq('id', roomId);

    return {
      id: pickId,
      roomId,
      playerId,
      optionId,
      roundNumber,
      turnNumber: room.current_turn,
      pickedAt: new Date().toISOString(),
      isTimeout: false,
    };
  }

  async skipTurn(roomId: string, _playerId: string): Promise<void> {
    const client = getClient();
    const { data: room } = await client.from('rooms').select('*').eq('id', roomId).single();
    if (!room || room.status !== 'drafting') return;

    const settings = room.settings as DraftSettings;
    const { data: players } = await client.from('players').select('*').eq('room_id', roomId);
    const newTurn = room.current_turn + 1;
    const finished = isDraftFinished(newTurn, players?.length || 0, settings.picksPerPlayer);

    await client.from('rooms').update({
      current_turn: newTurn,
      status: finished ? 'finished' : 'drafting',
      turn_started_at: finished ? null : (settings.timeLimit > 0 ? new Date().toISOString() : null),
      updated_at: new Date().toISOString(),
    }).eq('id', roomId);
  }

  async setOptions(roomId: string, playerId: string, options: DraftOption[]): Promise<void> {
    const client = getClient();
    const { data: room } = await client.from('rooms').select('*').eq('id', roomId).single();
    if (!room || room.host_id !== playerId) throw new Error('Apenas o host pode definir as opções.');

    await client.from('draft_options').delete().eq('room_id', roomId);
    if (options.length > 0) {
      const rows = options.map((o) => ({
        id: o.id,
        room_id: roomId,
        name: o.name,
        image_url: o.imageUrl,
        description: o.description,
        category: o.category,
        rating: o.rating,
        tags: o.tags,
        metadata: o.metadata,
      }));
      await client.from('draft_options').insert(rows);
    }
  }

  async addCustomOptions(roomId: string, playerId: string, inputs: CustomOptionInput[]): Promise<DraftOption[]> {
    const client = getClient();
    const { data: room } = await client.from('rooms').select('*').eq('id', roomId).single();
    if (!room || room.host_id !== playerId) throw new Error('Apenas o host pode adicionar opções.');

    const rows = inputs.map((input, i) => ({
      id: crypto.randomUUID(),
      room_id: roomId,
      name: input.name,
      image_url: input.imageUrl || '🎯',
      description: input.description || '',
      category: 'custom',
      rating: Math.max(50, 99 - i * 3),
      tags: ['custom'],
      metadata: {},
    }));

    await client.from('draft_options').insert(rows);
    return rows.map(mapOption);
  }

  async sendMessage(roomId: string, playerId: string, playerName: string, message: string): Promise<void> {
    const client = getClient();
    await client.from('chat_messages').insert({
      id: crypto.randomUUID(),
      room_id: roomId,
      player_id: playerId,
      player_name: playerName,
      message: message.slice(0, 500),
    });
  }

  async resetDraft(roomId: string, playerId: string): Promise<void> {
    const client = getClient();
    const { data: room } = await client.from('rooms').select('*').eq('id', roomId).single();
    if (!room || room.host_id !== playerId) throw new Error('Apenas o host pode reiniciar o draft.');

    await client.from('picks').delete().eq('room_id', roomId);
    await client.from('rooms').update({
      status: 'lobby',
      current_turn: 0,
      turn_started_at: null,
      updated_at: new Date().toISOString(),
    }).eq('id', roomId);
  }

  subscribe(roomId: string, callbacks: RoomCallbacks): () => void {
    const client = getClient();
    const channelName = `room_${roomId}_${Date.now()}`;

    const channel = client
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, (payload) => {
        if (payload.new) callbacks.onRoomUpdate(mapRoom(payload.new as Record<string, unknown>));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` }, async () => {
        const { data } = await client.from('players').select('*').eq('room_id', roomId).order('draft_order');
        if (data) callbacks.onPlayersUpdate(data.map(mapPlayer));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'picks', filter: `room_id=eq.${roomId}` }, async () => {
        const { data } = await client.from('picks').select('*').eq('room_id', roomId).order('turn_number');
        if (data) callbacks.onPicksUpdate(data.map(mapPick));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` }, async () => {
        const { data } = await client.from('chat_messages').select('*').eq('room_id', roomId).order('sent_at');
        if (data) callbacks.onMessagesUpdate(data.map(mapMessage));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'draft_options', filter: `room_id=eq.${roomId}` }, async () => {
        const { data } = await client.from('draft_options').select('*').eq('room_id', roomId);
        if (data) callbacks.onOptionsUpdate(data.map(mapOption));
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }

  async updateConnection(roomId: string, playerId: string, connected: boolean): Promise<void> {
    const client = getClient();
    await client.from('players').update({ is_connected: connected }).eq('id', playerId).eq('room_id', roomId);
  }
}
