import { useCallback } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { playPickSound, playTurnSound, playTimerWarningSound, playDraftCompleteSound } from '@/utils/sounds';

interface UseSoundResult {
  playPick: () => void;
  playTurn: () => void;
  playWarning: () => void;
  playComplete: () => void;
}

export function useSound(): UseSoundResult {
  const { settings } = useSettings();

  const playPick = useCallback(() => {
    if (settings.soundEnabled) {
      playPickSound();
    }
  }, [settings.soundEnabled]);

  const playTurn = useCallback(() => {
    if (settings.soundEnabled) {
      playTurnSound();
    }
  }, [settings.soundEnabled]);

  const playWarning = useCallback(() => {
    if (settings.soundEnabled) {
      playTimerWarningSound();
    }
  }, [settings.soundEnabled]);

  const playComplete = useCallback(() => {
    if (settings.soundEnabled) {
      playDraftCompleteSound();
    }
  }, [settings.soundEnabled]);

  return {
    playPick,
    playTurn,
    playWarning,
    playComplete
  };
}
