-- ============================================================
-- GameDraft — Supabase Database Schema
-- Execute this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM: room_status
-- ============================================================
CREATE TYPE room_status AS ENUM ('lobby', 'drafting', 'finished', 'closed');

-- ============================================================
-- TABLE: rooms
-- ============================================================
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(6) NOT NULL UNIQUE,
  host_id UUID NOT NULL,
  status room_status NOT NULL DEFAULT 'lobby',
  settings JSONB NOT NULL DEFAULT '{}',
  current_turn INTEGER NOT NULL DEFAULT 0,
  turn_started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_expires_at ON rooms(expires_at);

-- ============================================================
-- TABLE: players
-- ============================================================
CREATE TABLE players (
  id UUID PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  name VARCHAR(20) NOT NULL,
  avatar_seed VARCHAR(10) NOT NULL,
  is_host BOOLEAN NOT NULL DEFAULT FALSE,
  is_connected BOOLEAN NOT NULL DEFAULT TRUE,
  draft_order INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_players_room_id ON players(room_id);

-- ============================================================
-- TABLE: draft_options
-- ============================================================
CREATE TABLE draft_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  image_url TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  category VARCHAR(50) NOT NULL DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 50 CHECK (rating >= 0 AND rating <= 99),
  tags TEXT[] NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_draft_options_room_id ON draft_options(room_id);

-- ============================================================
-- TABLE: picks
-- ============================================================
CREATE TABLE picks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES draft_options(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL DEFAULT 1,
  turn_number INTEGER NOT NULL DEFAULT 0,
  picked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_timeout BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(room_id, option_id)  -- Prevent duplicate picks in the same room
);

CREATE INDEX idx_picks_room_id ON picks(room_id);
CREATE INDEX idx_picks_player_id ON picks(player_id);

-- ============================================================
-- TABLE: chat_messages
-- ============================================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  player_name VARCHAR(20) NOT NULL,
  message VARCHAR(500) NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);

-- ============================================================
-- FUNCTION: make_pick (atomic pick with concurrency protection)
-- ============================================================
CREATE OR REPLACE FUNCTION make_pick(
  p_room_id UUID,
  p_player_id UUID,
  p_option_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_room RECORD;
  v_settings JSONB;
  v_player_count INTEGER;
  v_current_turn INTEGER;
  v_expected_order INTEGER;
  v_expected_player_id UUID;
  v_mode TEXT;
  v_picks_per_player INTEGER;
  v_round INTEGER;
  v_new_turn INTEGER;
  v_is_finished BOOLEAN;
  v_time_limit INTEGER;
  v_pick_id UUID;
BEGIN
  -- Lock the room row to prevent concurrent picks
  SELECT * INTO v_room FROM rooms WHERE id = p_room_id FOR UPDATE;
  
  IF v_room IS NULL THEN
    RETURN jsonb_build_object('error', 'Sala não encontrada');
  END IF;
  
  IF v_room.status != 'drafting' THEN
    RETURN jsonb_build_object('error', 'O draft não está em andamento');
  END IF;
  
  v_settings := v_room.settings;
  v_mode := v_settings->>'mode';
  v_picks_per_player := (v_settings->>'picksPerPlayer')::INTEGER;
  v_time_limit := (v_settings->>'timeLimit')::INTEGER;
  v_current_turn := v_room.current_turn;
  
  -- Get player count
  SELECT COUNT(*) INTO v_player_count FROM players WHERE room_id = p_room_id;
  
  -- Calculate expected player (same logic as draft-engine.ts)
  IF v_mode = 'snake' THEN
    v_round := v_current_turn / v_player_count;
    IF v_round % 2 = 0 THEN
      v_expected_order := v_current_turn % v_player_count;
    ELSE
      v_expected_order := v_player_count - 1 - (v_current_turn % v_player_count);
    END IF;
  ELSE
    v_expected_order := v_current_turn % v_player_count;
  END IF;
  
  -- Get expected player ID
  SELECT id INTO v_expected_player_id
  FROM players
  WHERE room_id = p_room_id AND draft_order = v_expected_order;
  
  IF v_expected_player_id != p_player_id THEN
    RETURN jsonb_build_object('error', 'Não é sua vez de escolher');
  END IF;
  
  -- Check option not already picked
  IF EXISTS (SELECT 1 FROM picks WHERE room_id = p_room_id AND option_id = p_option_id) THEN
    RETURN jsonb_build_object('error', 'Esta opção já foi escolhida');
  END IF;
  
  -- Check option exists in room
  IF NOT EXISTS (SELECT 1 FROM draft_options WHERE id = p_option_id AND room_id = p_room_id) THEN
    RETURN jsonb_build_object('error', 'Opção inválida');
  END IF;
  
  -- Calculate round number
  v_round := (v_current_turn / v_player_count) + 1;
  v_new_turn := v_current_turn + 1;
  v_is_finished := v_new_turn >= (v_player_count * v_picks_per_player);
  
  -- Insert the pick
  v_pick_id := uuid_generate_v4();
  INSERT INTO picks (id, room_id, player_id, option_id, round_number, turn_number, is_timeout)
  VALUES (v_pick_id, p_room_id, p_player_id, p_option_id, v_round, v_current_turn, FALSE);
  
  -- Update room state
  UPDATE rooms SET
    current_turn = v_new_turn,
    status = CASE WHEN v_is_finished THEN 'finished'::room_status ELSE 'drafting'::room_status END,
    turn_started_at = CASE 
      WHEN v_is_finished THEN NULL 
      WHEN v_time_limit > 0 THEN NOW() 
      ELSE NULL 
    END,
    updated_at = NOW()
  WHERE id = p_room_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'pick_id', v_pick_id,
    'finished', v_is_finished
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCTION: cleanup_expired_rooms
-- ============================================================
CREATE OR REPLACE FUNCTION cleanup_expired_rooms() RETURNS void AS $$
BEGIN
  UPDATE rooms SET status = 'closed' WHERE expires_at < NOW() AND status != 'closed';
  -- Optionally delete very old rooms (> 7 days)
  DELETE FROM rooms WHERE expires_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Enable Realtime for all tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE picks;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE draft_options;
