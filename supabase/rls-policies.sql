-- ============================================================
-- GameDraft — Row Level Security Policies
-- Execute AFTER schema.sql in the Supabase SQL Editor
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ROOMS policies
-- ============================================================

-- Anyone can read rooms (needed for joining by code)
CREATE POLICY "rooms_select" ON rooms
  FOR SELECT USING (true);

-- Anyone can create rooms
CREATE POLICY "rooms_insert" ON rooms
  FOR INSERT WITH CHECK (true);

-- Only update by host (using anon key, validated by app logic)
-- Since we use anonymous auth, we allow updates and rely on
-- application-level validation (service layer checks host_id)
CREATE POLICY "rooms_update" ON rooms
  FOR UPDATE USING (true);

-- ============================================================
-- PLAYERS policies
-- ============================================================

-- Anyone can read players in any room (needed for lobby display)
CREATE POLICY "players_select" ON players
  FOR SELECT USING (true);

-- Anyone can insert (join a room)
CREATE POLICY "players_insert" ON players
  FOR INSERT WITH CHECK (true);

-- Anyone can update (connection status, host transfer)
CREATE POLICY "players_update" ON players
  FOR UPDATE USING (true);

-- Anyone can delete (leave room, kick)
CREATE POLICY "players_delete" ON players
  FOR DELETE USING (true);

-- ============================================================
-- DRAFT_OPTIONS policies
-- ============================================================

-- Anyone can read options
CREATE POLICY "draft_options_select" ON draft_options
  FOR SELECT USING (true);

-- Anyone can insert (host adds options)
CREATE POLICY "draft_options_insert" ON draft_options
  FOR INSERT WITH CHECK (true);

-- Anyone can delete (host resets options)
CREATE POLICY "draft_options_delete" ON draft_options
  FOR DELETE USING (true);

-- ============================================================
-- PICKS policies
-- ============================================================

-- Anyone can read picks
CREATE POLICY "picks_select" ON picks
  FOR SELECT USING (true);

-- Insert protected by make_pick() function
CREATE POLICY "picks_insert" ON picks
  FOR INSERT WITH CHECK (true);

-- No updates or deletes on picks (immutable)
-- (No UPDATE or DELETE policies = denied by default with RLS on)

-- ============================================================
-- CHAT_MESSAGES policies
-- ============================================================

-- Anyone can read messages
CREATE POLICY "chat_messages_select" ON chat_messages
  FOR SELECT USING (true);

-- Anyone can insert messages
CREATE POLICY "chat_messages_insert" ON chat_messages
  FOR INSERT WITH CHECK (true);

-- No updates or deletes on messages

-- ============================================================
-- NOTE ON SECURITY
-- ============================================================
-- Since GameDraft uses anonymous session-based identity (no Supabase Auth),
-- the RLS policies are permissive at the row level. The actual authorization
-- logic (host validation, turn validation, etc.) is enforced by:
--
-- 1. The make_pick() PL/pgSQL function (atomic, with row locking)
-- 2. The application service layer (validates host_id, player_id, etc.)
--
-- For a production deployment with user authentication, these policies
-- should be tightened to use auth.uid() for row-level ownership checks.
-- ============================================================
