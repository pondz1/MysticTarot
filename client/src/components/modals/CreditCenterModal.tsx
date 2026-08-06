import React, { useState, useEffect } from 'react';
import { Coins, X, Gift, Ticket, CreditCard, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/apiClient';
import { TopUpSimulatorModal } from './TopUpSimulatorModal';

interface CreditCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreditCenterModal: React.FC<CreditCenterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { credits: authCredits, refreshCredits } = useAuth();
  const [credits, setCredits] = useState<number | null>(authCredits);
  const [loadingCredits, setLoadingCredits] = useState<boolean>(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState<boolean>(false);

  // Action messages & state
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [promoMsg, setPromoMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [dailyMsg, setDailyMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [fastRefillMsg, setFastRefillMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCredits();
    }
  }, [isOpen]);

  useEffect(() => {
    setCredits(authCredits);
  }, [authCredits]);

  const fetchCredits = async () => {
    setLoadingCredits(true);
    try {
      const data = await apiClient.get<{ credits?: number }>('/api/user/credits');
      if (typeof data.credits === 'number') {
        setCredits(data.credits);
      }
    } catch (e) {
      console.warn('Failed to fetch user credits:', e);
    } finally {
      setLoadingCredits(false);
    }
  };

  const handleClaimDailyBonus = async () => {
    try {
      const data = await apiClient.post<{ credits: number; message: string }>('/api/user/claim-daily');
      if (typeof data.credits === 'number') {
        setCredits(data.credits);
        window.dispatchEvent(new CustomEvent('user_credits_updated', { detail: data.credits }));
        refreshCredits();
        setDailyMsg({ success: true, text: data.message || 'รับโบนัสฟรีวันนี้สำเร็จ (+10 CR)!' });
      }
    } catch (err: any) {
      setDailyMsg({ success: false, text: err?.message || 'คุณได้รับสิทธิ์ของวันนี้ไปแล้ว' });
    }
  };

  const handleRedeemPromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;

    try {
      const data = await apiClient.post<{ credits: number; message: string }>('/api/user/redeem-code', {
        code: promoCodeInput.trim(),
      });
      if (typeof data.credits === 'number') {
        setCredits(data.credits);
        window.dispatchEvent(new CustomEvent('user_credits_updated', { detail: data.credits }));
        refreshCredits();
        setPromoMsg({ success: true, text: data.message });
        setPromoCodeInput('');
      }
    } catch (err: any) {
      setPromoMsg({ success: false, text: err?.message || 'โค้ดส่วนลดไม่ถูกต้อง' });
    }
  };

  const handleFastRefill = async () => {
    try {
      const data = await apiClient.post<{ credits: number }>('/api/user/refill', { amount: 10 });
      if (typeof data.credits === 'number') {
        setCredits(data.credits);
        window.dispatchEvent(new CustomEvent('user_credits_updated', { detail: data.credits }));
        refreshCredits();
        setFastRefillMsg('+10 เติมสำเร็จ!');
        setTimeout(() => setFastRefillMsg(null), 2000);
      }
    } catch (err) {
      console.warn('Failed fast refill:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
        <div className="relative w-full max-w-lg glass-panel-gold rounded-2xl p-6 border border-amber-400/50 shadow-2xl overflow-hidden my-8 max-h-[90vh] overflow-y-auto">
          
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-amber-500/30 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
                <Coins className="w-5 h-5 animate-bounce-slow" />
              </div>
              <div>
                <h3 className="text-base font-bold font-serif-mystic text-gold-gradient">
                  ศูนย์รวม เครดิต (Credit Center)
                </h3>
                <p className="text-[11px] text-purple-300">จัดการและเติม เครดิตสำหรับทำนายดวงชะตาด้วย AI</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-purple-300 hover:text-white hover:bg-purple-900/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Credit Balance Card */}
          <div className="p-4 rounded-xl bg-purple-950/70 border border-amber-500/40 flex items-center justify-between shadow-inner mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
                <Coins className="w-7 h-7 animate-bounce-slow" />
              </div>
              <div>
                <div className="text-xs text-purple-200 font-medium">ยอด Credit คงเหลือของคุณ</div>
                <div className="text-3xl font-extrabold text-amber-300 font-serif-mystic">
                  {loadingCredits ? '...' : (credits !== null ? `${credits} CR` : '10 CR')}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFastRefill}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-900/80 hover:bg-purple-800 border border-amber-400/40 text-amber-200 transition-all cursor-pointer flex items-center gap-1"
              title="เติม เครดิต พิเศษ"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{fastRefillMsg || 'เติมด่วน (+10 CR)'}</span>
            </button>
          </div>

          {/* 4 Refill Channels Header */}
          <div className="text-xs font-bold text-amber-300/90 font-serif-mystic flex items-center gap-1.5 mb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>ช่องทางการเติม Credit ทั้งหมด (4 ช่องทาง):</span>
          </div>

          {/* 4 Refill Options List */}
          <div className="grid grid-cols-1 gap-3.5 mb-5">

            {/* Option 1: Daily Free Bonus */}
            <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 hover:border-amber-400/40 transition-all flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-purple-100">1. โบนัสประจำวัน (Daily Bonus)</span>
                </div>
                <button
                  type="button"
                  onClick={handleClaimDailyBonus}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 transition-all cursor-pointer"
                >
                  กดรับฟรี (+10 CR)
                </button>
              </div>
              {dailyMsg && (
                <div className={`text-[11px] px-2.5 py-1 rounded-md ${dailyMsg.success ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                  {dailyMsg.text}
                </div>
              )}
            </div>

            {/* Option 2: Promo / Redeem Code */}
            <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 hover:border-amber-400/40 transition-all flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <Ticket className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-purple-100">2. กรอกโค้ดส่วนลด (Promo Code)</span>
              </div>

              <form onSubmit={handleRedeemPromoCode} className="flex gap-2">
                <input
                  type="text"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  placeholder="ระบุโค้ดส่วนลด (ตัวอย่าง: TAROT2026)"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-black/50 border border-purple-500/40 text-xs text-amber-200 placeholder-purple-400/60 uppercase font-mono focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-purple-950 transition-all cursor-pointer"
                >
                  ใช้งานโค้ด
                </button>
              </form>

              {promoMsg && (
                <div className={`text-[11px] px-2.5 py-1 rounded-md ${promoMsg.success ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                  {promoMsg.text}
                </div>
              )}
            </div>

            {/* Option 3: Top-Up Packages */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-purple-950/60 to-purple-950/40 border border-amber-400/50 transition-all flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-amber-300" />
                <div>
                  <div className="text-xs font-bold text-amber-300">3. แพ็กเกจเติม เครดิต (PromptPay / Card)</div>
                  <div className="text-[10px] text-purple-300">เลือกแพ็กเกจ 20-310 Credits เติมทันทีผ่านระบบอัตโนมัติ</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsTopUpModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-purple-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer whitespace-nowrap"
              >
                เลือกแพ็กเกจเติมเงิน
              </button>
            </div>

            {/* Option 4: Admin API */}
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 flex items-center justify-between text-[11px] text-purple-300">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>4. เติม เครดิตผ่านระบบ Admin (ระบบจัดการสำหรับเจ้าหน้าที่)</span>
              </div>
            </div>

          </div>

          {/* Footer Action */}
          <div className="flex justify-end border-t border-amber-500/20 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-purple-950 transition-all shadow-md cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>

        </div>
      </div>

      {/* Top Up Packages Modal */}
      <TopUpSimulatorModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        onSuccess={(newCredits) => setCredits(newCredits)}
      />
    </>
  );
};
