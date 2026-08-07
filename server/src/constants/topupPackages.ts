export interface TopUpPackage {
  id: string;
  name: string;
  baseCredits: number;
  bonusCredits: number;
  priceThb: number;
  badge?: string;
  popular?: boolean;
}

/**
 * Launch pricing: fair starter + clear upsell ladder.
 * ~9–10 cr per AI reading. All packs ≥ ฿20 → PromptPay eligible.
 */
export const TOPUP_PACKAGES: TopUpPackage[] = [
  {
    id: 'pkg_starter',
    name: 'Starter Pack',
    baseCredits: 60,
    bonusCredits: 0,
    priceThb: 20,
    badge: '🌱 เริ่มต้น',
  },
  {
    id: 'pkg_popular',
    name: 'Popular Pack',
    baseCredits: 100,
    bonusCredits: 30,
    priceThb: 39,
    badge: '🔥 ขายดีที่สุด',
    popular: true,
  },
  {
    id: 'pkg_pro',
    name: 'Pro Pack',
    baseCredits: 200,
    bonusCredits: 80,
    priceThb: 69,
    badge: '✨ คุ้มค่า',
  },
  {
    id: 'pkg_ultimate',
    name: 'Ultimate Pack',
    baseCredits: 400,
    bonusCredits: 200,
    priceThb: 129,
    badge: '🚀 โบนัส +50%',
  },
];
