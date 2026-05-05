const errorMap: Record<string, string> = {
  'Invalid login credentials':       'E-posta veya şifre hatalı.',
  'Email not confirmed':             'E-posta adresiniz henüz doğrulanmamış. Gelen kutunuzu kontrol edin.',
  'User already registered':         'Bu e-posta adresiyle zaten bir hesap var.',
  'Password should be at least 6 characters': 'Şifre en az 6 karakter olmalıdır.',
  'Email rate limit exceeded':       'Çok fazla deneme yapıldı. Lütfen bir süre bekleyin.',
  'For security purposes, you can only request this after':
    'Güvenlik nedeniyle kısa süre içinde tekrar istek gönderemezsiniz.',
  'Unable to validate email address: invalid format':
    'Geçerli bir e-posta adresi girin.',
  'Failed to fetch': 'Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.',
}

export function toTurkishAuthError(message: string): string {
  for (const [key, value] of Object.entries(errorMap)) {
    if (message.includes(key)) return value
  }
  return 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.'
}
