export interface TopUpPackage {
  id: string;
  name: string;
  baseCredits: number;
  bonusCredits: number;
  priceThb: number;
  badge?: string;
  popular?: boolean;
}

export const TOPUP_PACKAGES: TopUpPackage[] = [
  {
    id: 'pkg_starter',
    name: 'Starter Pack',
    baseCredits: 20,
    bonusCredits: 0,
    priceThb: 29,
  },
  {
    id: 'pkg_popular',
    name: 'Popular Pack',
    baseCredits: 50,
    bonusCredits: 5,
    priceThb: 59,
    badge: '🔥 ขายดีที่สุด',
    popular: true,
  },
  {
    id: 'pkg_pro',
    name: 'Pro Pack',
    baseCredits: 100,
    bonusCredits: 20,
    priceThb: 99,
    badge: '✨ คุ้มค่า',
  },
  {
    id: 'pkg_ultimate',
    name: 'Ultimate Pack',
    baseCredits: 250,
    bonusCredits: 60,
    priceThb: 199,
    badge: '🚀 โบนัส +24%',
  },
];
