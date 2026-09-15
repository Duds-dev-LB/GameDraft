import { createClient } from '@supabase/supabase-js';

/**
 * Sanitizes and normalizes the Supabase URL.
 * Strips accidental trailing slashes, quotes, whitespace, and path suffixes like /rest/v1 or /api.
 * For example:
 *   "https://xyz.supabase.co/rest/v1/" -> "https://xyz.supabase.co"
 *   "https://xyz.supabase.co/"         -> "https://xyz.supabase.co"
 *   "'https://xyz.supabase.co'"        -> "https://xyz.supabase.co"
 */
function sanitizeSupabaseUrl(rawUrl: string | undefined): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim().replace(/^["']|["']$/g, '').trim();

  try {
    const parsed = new URL(url);
    // If it's a standard Supabase cloud domain (*.supabase.co), strictly use the origin (protocol + host)
    if (parsed.hostname.endsWith('.supabase.co')) {
      return parsed.origin;
    }
    // For custom domains or local setups, strip accidental /rest/v1, /api, and trailing slashes
    const cleanPath = parsed.pathname
      .replace(/\/rest\/v1\/?$/i, '')
      .replace(/\/api\/?$/i, '')
      .replace(/\/+$/, '');
    return `${parsed.origin}${cleanPath}`;
  } catch {
    // If URL constructor fails, sanitize with regex
    return url
      .replace(/\/rest\/v1\/?$/i, '')
      .replace(/\/api\/?$/i, '')
      .replace(/\/+$/, '');
  }
}

/**
 * Sanitizes the Supabase anon key by trimming quotes and whitespace.
 */
function sanitizeSupabaseKey(rawKey: string | undefined): string {
  if (!rawKey) return '';
  return rawKey.trim().replace(/^["']|["']$/g, '').trim();
}

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseUrl = sanitizeSupabaseUrl(rawUrl);
export const supabaseKey = sanitizeSupabaseKey(rawKey);

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl.startsWith('http') &&
  supabaseKey.length > 10
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;
