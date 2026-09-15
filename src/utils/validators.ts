export function validatePlayerName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'O nome não pode estar vazio' };
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { valid: false, error: 'O nome deve ter pelo menos 2 caracteres' };
  }
  if (trimmed.length > 20) {
    return { valid: false, error: 'O nome deve ter no máximo 20 caracteres' };
  }
  return { valid: true };
}

export function validateRoomCode(code: string): { valid: boolean; error?: string } {
  if (!code || code.trim() === '') {
    return { valid: false, error: 'O código da sala é obrigatório' };
  }
  const formatted = code.trim().toUpperCase();
  if (formatted.length !== 6) {
    return { valid: false, error: 'O código da sala deve ter 6 caracteres' };
  }
  if (!/^[A-Z0-9]+$/.test(formatted)) {
    return { valid: false, error: 'O código deve conter apenas letras e números' };
  }
  return { valid: true };
}

export function validateChatMessage(msg: string): { valid: boolean; error?: string } {
  if (!msg || msg.trim() === '') {
    return { valid: false, error: 'A mensagem não pode estar vazia' };
  }
  if (msg.trim().length > 500) {
    return { valid: false, error: 'A mensagem é muito longa (máximo 500 caracteres)' };
  }
  return { valid: true };
}
