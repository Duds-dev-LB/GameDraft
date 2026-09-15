import { footballPlayers } from './football';
import { nbaPlayers } from './nba';
import { gameCharacters } from './games';
import { fictionCharacters } from './characters';
import type { DraftCategory, DraftOptionTemplate } from '@/types';

export { footballPlayers, nbaPlayers, gameCharacters, fictionCharacters };

export function getOptionsForCategory(category: DraftCategory): DraftOptionTemplate[] {
  switch (category) {
    case 'football':
      return footballPlayers;
    case 'nba':
      return nbaPlayers;
    case 'games':
      return gameCharacters;
    case 'characters':
    case 'fiction':
      return fictionCharacters;
    case 'custom':
    default:
      return [];
  }
}
