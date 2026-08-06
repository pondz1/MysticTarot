export interface PromoCode {
  code: string;
  credits: number;
  description: string;
}

export const PROMO_CODES: Record<string, PromoCode> = {
  'TAROT2026': { code: 'TAROT2026', credits: 20, description: 'โค้ดต้อนรับสมาชิกใหม่ (+20 CR)' },
  'MYSTIC50': { code: 'MYSTIC50', credits: 50, description: 'โค้ดโบนัสพิเศษ Mystic (+50 CR)' },
  'WELCOME10': { code: 'WELCOME10', credits: 10, description: 'โค้ดทดลองใช้งาน (+10 CR)' },
};
