import React, { useState, useEffect } from 'react';
import { Coins, X, Gift, Ticket, CreditCard, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/apiClient';
import { TopUpSimulatorModal } from './TopUpSimulatorModal';
import { ModalShell } from '../common/ModalShell';

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

  return (
    <>
      <ModalShell
        isOpen={isOpen}
        onClose={onClose}
        titleId="credit-center-title"
        maxWidthClass="max-w-lg"
        panelClassName="glass-panel-gold rounded-2xl p-6 border border-amber-400/50 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto overscroll-contain"
        closeOnBackdrop={!isTopUpModalOpen}
        enableA11y={!isTopUpModalOpen}
      >
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-amber-500/30 pb-3 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 shrink-0">
                <Coins className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h3 id="credit-center-title" className="text-base font-bold text-amber-100">
                  เครดิต AI
                </h3>
                <p className="text-[11px] text-slate-400 leading-snug">
                  ใช้จ่ายเมื่อขอคำทำนายด้วย AI — หมดแล้วยังอ่านแบบมาตรฐานได้
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="ปิดหน้าต่างเครดิต AI"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-400 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 mb-4 leading-relaxed">
            <strong className="text-amber-200/90 font-semibold">เครดิต AI คืออะไร?</strong>
            {' '}หน่วยสำหรับเรียก AI วิเคราะห์คำทำนาย ถ้าเครดิตหมดหรือ AI ขัดข้อง
            ยังเลือก「คำทำนายมาตรฐาน」หรือใส่ API Key ของคุณในตั้งค่า AI ได้
          </p>

          {/* Credit Balance Card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/35 flex items-center justify-between gap-3 shadow-inner mb-5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/35 text-amber-300 shrink-0">
                <Coins className="w-7 h-7" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-slate-400 font-medium">เครดิตคงเหลือ</div>
                <div className="text-3xl font-extrabold text-amber-200 tabular-nums tracking-tight">
                  {loadingCredits ? '…' : (credits !== null ? credits : '—')}
                  <span className="text-sm font-semibold text-amber-200/70 ml-1.5">หน่วย</span>
                </div>
                {credits !== null && credits <= 0 && (
                  <p className="text-[11px] text-rose-300/90 mt-0.5">
                    เครดิตหมด — เติมด้านล่าง หรือใช้คำทำนายมาตรฐาน
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleFastRefill}
              className="px-3 py-2 min-h-[40px] rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-amber-400/40 text-amber-200 transition-colors cursor-pointer flex items-center gap-1 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              title="เติมเครดิตด่วน +10 หน่วย"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              <span>{fastRefillMsg || 'เติมด่วน +10'}</span>
            </button>
          </div>

          <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-3">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
            <span>วิธีเติมเครดิต</span>
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
                  รับฟรี +10
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
                  id="promo-code-input"
                  name="promo-code"
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="โค้ดส่วนลดเครดิต"
                  placeholder="เช่น TAROT2026…"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-black/50 border border-purple-500/40 text-xs text-amber-200 placeholder-slate-500 uppercase font-mono focus:outline-none focus-visible:border-amber-400 focus-visible:ring-1 focus-visible:ring-amber-400/40"
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
                  <div className="text-xs font-bold text-amber-200">3. แพ็กเกจเติมเครดิต</div>
                  <div className="text-[10px] text-slate-400">PromptPay / บัตร · แพ็ก 20–310 หน่วย</div>
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
                <span>4. ระบบ Admin (สำหรับเจ้าหน้าที่)</span>
              </div>
            </div>

          </div>

          {/* Footer Action */}
          <div className="flex justify-end border-t border-amber-500/20 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 min-h-[40px] rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              ปิด
            </button>
          </div>
      </ModalShell>

      <TopUpSimulatorModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        onSuccess={(newCredits) => setCredits(newCredits)}
      />
    </>
  );
};
