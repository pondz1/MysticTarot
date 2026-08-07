export interface TopUpPackage {
  id: string;
  name: string;
  baseCredits: number;
  bonusCredits: number;
  priceThb: number;
  badge?: string;
  /** Short psychology line under the pack (e.g. social proof / value frame) */
  tagline?: string;
  popular?: boolean;
}

/**
 * Launch pricing with behavioral design + generous credits (new site).
 * - Charm prices (…9) except Starter ฿20 = Omise PromptPay minimum
 * - Starter = fair entry · Popular = target · Ultimate = high anchor
 * ~9–10 cr ≈ 1 AI reading
 */
export const TOPUP_PACKAGES: TopUpPackage[] = [
  {
    id: 'pkg_starter',
    name: 'Starter',
    baseCredits: 100,
    bonusCredits: 0,
    priceThb: 20,
    badge: 'ทดลองใช้',
    tagline: 'เริ่มต้นง่าย · PromptPay ได้',
  },
  {
    id: 'pkg_popular',
    name: 'Popular',
    baseCredits: 180,
    bonusCredits: 40,
    priceThb: 39,
    badge: 'คนส่วนใหญ่เลือก',
    tagline: 'คุ้มสุดสำหรับมือใหม่',
    popular: true,
  },
  {
    id: 'pkg_pro',
    name: 'Pro',
    baseCredits: 360,
    bonusCredits: 120,
    priceThb: 69,
    badge: 'ใช้ประจำ',
    tagline: 'โบนัสมากขึ้นเมื่อเติมก้อนใหญ่',
  },
  {
    id: 'pkg_ultimate',
    name: 'Ultimate',
    baseCredits: 650,
    bonusCredits: 350,
    priceThb: 129,
    badge: 'โบนัส +54%',
    tagline: 'ได้เครดิตเยอะสุด · โบนัสสูงสุด',
  },
];
