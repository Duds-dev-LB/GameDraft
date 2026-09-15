const colors = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
  '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
  '#fb7185', '#34d399', '#fbbf24', '#a3e635'
];

const emojis = [
  '🎮', '🎲', '👾', '🚀', '⭐', '⚡', '🔥', '🏆', '👑', '🐉', 
  '🦄', '🐼', '🦊', '🦁', '🐅', '🐙', '🦖', '👻', '👽', '🤖',
  '🎃', '⛄', '🎈', '🎉', '🎸', '🕹️', '🧩', '🎯', '🛹', '🛸'
];

function getStringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export function getAvatarColor(seed: string): string {
  if (!seed) return colors[0];
  const hash = getStringHash(seed);
  return colors[hash % colors.length];
}

export function getAvatarInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getAvatarEmoji(seed: string): string {
  if (!seed) return emojis[0];
  const hash = getStringHash(seed);
  return emojis[hash % emojis.length];
}
