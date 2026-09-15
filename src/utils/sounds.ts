let isEnabled = true;

// Helper to create oscillator
function playTone(frequency: number, type: OscillatorType, duration: number, volume = 0.1) {
  if (!isEnabled) return;
  if (typeof window === 'undefined') return;
  
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    
    gainNode.gain.setValueAtTime(volume, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  } catch (e) {
    console.error('Audio playback failed', e);
  }
}

export function playPickSound(): void {
  playTone(440, 'sine', 0.1, 0.2);
  setTimeout(() => playTone(660, 'sine', 0.1, 0.2), 100);
}

export function playTurnSound(): void {
  playTone(523.25, 'triangle', 0.2, 0.1);
}

export function playTimerWarningSound(): void {
  playTone(880, 'square', 0.1, 0.05);
}

export function playDraftCompleteSound(): void {
  const notes = [440, 554.37, 659.25, 880];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 'sine', 0.3, 0.2), i * 150);
  });
}

export function setSoundEnabled(enabled: boolean): void {
  isEnabled = enabled;
}

export function isSoundEnabled(): boolean {
  return isEnabled;
}
