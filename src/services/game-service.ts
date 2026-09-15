import type { GameService } from './types';
import { isSupabaseConfigured } from '@/lib/supabase';
import { LocalProvider } from './local-provider';
import { SupabaseProvider } from './supabase-provider';

let service: GameService | null = null;

export function getGameService(): GameService {
  if (!service) {
    if (isSupabaseConfigured) {
      service = new SupabaseProvider();
    } else {
      service = new LocalProvider();
    }
  }
  return service;
}

export function isLocalMode(): boolean {
  return !isSupabaseConfigured;
}

export function getLocalProvider(): LocalProvider | null {
  if (!isSupabaseConfigured && service instanceof LocalProvider) {
    return service;
  }
  return null;
}
