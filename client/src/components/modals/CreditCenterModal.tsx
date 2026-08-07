import React, { useState, useEffect, useCallback } from 'react';
import {
  Coins,
  X,
  Gift,
  Ticket,
  CreditCard,
  Sparkles,
  Zap,
  ShieldCheck,
  Loader2,
  FlaskConical,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient, ApiError } from '../../services/apiClient';
import { TopUpSimulatorModal } from './TopUpSimulatorModal';
import { ModalShell } from '../common/ModalShell';

interface CreditCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'พร้อมรับแล้ว';
  const totalMin = Math.ceil(ms / 60000);
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (hours <= 0) return `อีก ${mins} นาที`;
  return `อีก ${hours} ชม. ${mins} นาที`;
}

export const CreditCenterModal: React.FC<CreditCenterModalProps> = ({ isOpen, onClose }) => {
  const { credits: authCredits, updateCredits, refreshCredits, features, refreshFeatures } =
    useAuth();
  const [credits, setCredits] = useState<number | null>(authCredits);
  const [loadingCredits, setLoadingCredits] = useState<boolean>(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState<boolean>(false);

  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [promoMsg, setPromoMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [dailyMsg, setDailyMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [fastRefillMsg, setFastRefillMsg] = useState<{ success: boolean; text: string } | null>(
    null
  );

  const [canClaimDaily, setCanClaimDaily] = useState<boolean>(true);
  const [nextDailyMs, setNextDailyMs] = useState<number>(0);
  const [claimingDaily, setClaimingDaily] = useState(false);
  const [redeemingPromo, setRedeemingPromo] = useState(false);
  const [fastRefilling, setFastRefilling] = useState(false);

  const showFastRefill = features?.fastRefill && !features?.isProduction;
  const showPaidTopup = Boolean(features?.paidTopup ?? features?.omisePayments ?? features?.topupSimulator);
  const omiseLive = Boolean(features?.omisePayments);

  const applyCredits = useCallback(
    (next: number) => {
      setCredits(next);
      updateCredits(next);
    },
    [updateCredits]
  );

  const fetchDailyStatus = useCallback(async () => {
    try {
      const status = await apiClient.get<{
        canClaim?: boolean;
        nextAvailableMs?: number;
      }>('/api/user/daily-status');
      setCanClaimDaily(status.canClaim !== false);
      setNextDailyMs(typeof status.nextAvailableMs === 'number' ? status.nextAvailableMs : 0);
    } catch {
      // keep previous state
    }
  }, []);

  const fetchCredits = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setPromoMsg(null);
    setDailyMsg(null);
    setFastRefillMsg(null);
    void fetchCredits();
    void fetchDailyStatus();
    void refreshFeatures();
  }, [isOpen, fetchCredits, fetchDailyStatus, refreshFeatures]);

  useEffect(() => {
    setCredits(authCredits);
  }, [authCredits]);

  // Live countdown — do NOT put nextDailyMs in deps (restarts + re-renders every tick → scroll jump)
  useEffect(() => {
    if (!isOpen || canClaimDaily) return;
    const id = window.setInterval(() => {
      setNextDailyMs((prev) => {
        if (prev <= 30_000) {
          setCanClaimDaily(true);
          return 0;
        }
        return prev - 30_000;
      });
    }, 30_000);
    return () => window.clearInterval(id);
  }, [isOpen, canClaimDaily]);

  const handleClaimDailyBonus = async () => {
    if (claimingDaily || !canClaimDaily) return;
    setClaimingDaily(true);
    setDailyMsg(null);
    try {
      const data = await apiClient.post<{ credits: number; message: string }>(
        '/api/user/claim-daily'
      );
      if (typeof data.credits === 'number') {
        applyCredits(data.credits);
        setDailyMsg({
          success: true,
          text: data.message || 'รับโบนัสฟรีวันนี้สำเร็จ (+10 CR)!',
        });
        setCanClaimDaily(false);
        setNextDailyMs(24 * 60 * 60 * 1000);
      }
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'คุณได้รับสิทธิ์ของวันนี้ไปแล้ว';
      setDailyMsg({ success: false, text: message });
      void fetchDailyStatus();
    } finally {
      setClaimingDaily(false);
    }
  };

  const handleRedeemPromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeInput.trim() || redeemingPromo) return;

    setRedeemingPromo(true);
    setPromoMsg(null);
    try {
      const data = await apiClient.post<{ credits: number; message: string }>(
        '/api/user/redeem-code',
        { code: promoCodeInput.trim() }
      );
      if (typeof data.credits === 'number') {
        applyCredits(data.credits);
        setPromoMsg({ success: true, text: data.message });
        setPromoCodeInput('');
      }
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'โค้ดส่วนลดไม่ถูกต้อง';
      setPromoMsg({ success: false, text: message });
    } finally {
      setRedeemingPromo(false);
    }
  };

  const handleFastRefill = async () => {
    if (fastRefilling || !showFastRefill) return;
    setFastRefilling(true);
    setFastRefillMsg(null);
    try {
      const data = await apiClient.post<{ credits: number }>('/api/user/refill', { amount: 10 });
      if (typeof data.credits === 'number') {
        applyCredits(data.credits);
        setFastRefillMsg({ success: true, text: '+10 เติมสำเร็จ!' });
        setTimeout(() => setFastRefillMsg(null), 2000);
      }
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'เติมด่วนใช้ไม่ได้ใน production';
      setFastRefillMsg({ success: false, text: message });
    } finally {
      setFastRefilling(false);
    }
  };

  return (
    <>
      <ModalShell
        isOpen={isOpen}
        onClose={onClose}
        titleId="credit-center-title"
        maxWidthClass="max-w-lg"
        panelClassName="glass-panel-gold rounded-2xl p-6 border border-amber-400/50 shadow-2xl max-h-[min(90vh,900px)] overflow-y-auto overscroll-contain"
        closeOnBackdrop={!isTopUpModalOpen}
        enableA11y={!isTopUpModalOpen}
        align="start"
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
          <strong className="text-amber-200/90 font-semibold">เครดิต AI คืออะไร?</strong>{' '}
          หน่วยสำหรับเรียก AI วิเคราะห์คำทำนาย ถ้าเครดิตหมดหรือ AI ขัดข้อง
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
                {loadingCredits ? '…' : credits !== null ? credits : '—'}
                <span className="text-sm font-semibold text-amber-200/70 ml-1.5">หน่วย</span>
              </div>
              {credits !== null && credits <= 0 && (
                <p className="text-[11px] text-rose-300/90 mt-0.5">
                  เครดิตหมด — เติมด้านล่าง หรือใช้คำทำนายมาตรฐาน
                </p>
              )}
              {fastRefillMsg && (
                <p
                  className={`text-[11px] mt-0.5 ${
                    fastRefillMsg.success ? 'text-emerald-300' : 'text-rose-300'
                  }`}
                >
                  {fastRefillMsg.text}
                </p>
              )}
            </div>
          </div>

          {showFastRefill && (
            <button
              type="button"
              onClick={handleFastRefill}
              disabled={fastRefilling}
              className="px-3 py-2 min-h-[40px] rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-amber-400/40 text-amber-200 transition-colors cursor-pointer flex items-center gap-1 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-50"
              title="เติมเครดิตด่วน +10 หน่วย (โหมดพัฒนา)"
            >
              {fastRefilling ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Zap className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              )}
              <span>เติมด่วน +10</span>
            </button>
          )}
        </div>

        <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-3">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
          <span>วิธีเติมเครดิต</span>
        </div>

        <div className="grid grid-cols-1 gap-3.5 mb-5">
          {/* Option 1: Daily Free Bonus */}
          <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 hover:border-amber-400/40 transition-all flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Gift className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-purple-100">1. โบนัสประจำวัน</span>
              </div>
              <button
                type="button"
                onClick={handleClaimDailyBonus}
                disabled={claimingDaily || !canClaimDaily}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shrink-0"
              >
                {claimingDaily && <Loader2 className="w-3 h-3 animate-spin" />}
                {canClaimDaily ? 'รับฟรี +10' : formatCountdown(nextDailyMs)}
              </button>
            </div>
            {!canClaimDaily && !dailyMsg && (
              <div className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800/60 text-slate-400">
                รับโบนัสไปแล้ว — รอ {formatCountdown(nextDailyMs)}
              </div>
            )}
            {dailyMsg && (
              <div
                className={`text-[11px] px-2.5 py-1 rounded-md ${
                  dailyMsg.success
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {dailyMsg.text}
              </div>
            )}
          </div>

          {/* Option 2: Promo / Redeem Code */}
          <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 hover:border-amber-400/40 transition-all flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <Ticket className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-purple-100">2. กรอกโค้ดส่วนลด</span>
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
                disabled={redeemingPromo}
                aria-label="โค้ดส่วนลดเครดิต"
                placeholder="เช่น TAROT2026…"
                className="flex-1 px-3 py-1.5 rounded-lg bg-black/50 border border-purple-500/40 text-xs text-amber-200 placeholder-slate-500 uppercase font-mono focus:outline-none focus-visible:border-amber-400 focus-visible:ring-1 focus-visible:ring-amber-400/40 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={redeemingPromo || !promoCodeInput.trim()}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-purple-950 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
              >
                {redeemingPromo && <Loader2 className="w-3 h-3 animate-spin" />}
                ใช้งานโค้ด
              </button>
            </form>

            {promoMsg && (
              <div
                className={`text-[11px] px-2.5 py-1 rounded-md ${
                  promoMsg.success
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {promoMsg.text}
              </div>
            )}
          </div>

          {/* Option 3: Top-Up Packages (Omise or simulator) */}
          {showPaidTopup ? (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-purple-950/60 to-purple-950/40 border border-amber-400/50 transition-all flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <CreditCard className="w-5 h-5 text-amber-300 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-amber-200 flex items-center gap-1.5 flex-wrap">
                      3. แพ็กเกจเติมเครดิต
                      {omiseLive ? (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200">
                          Omise
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-fuchsia-500/25 border border-fuchsia-400/40 text-fuchsia-200">
                          <FlaskConical className="w-2.5 h-2.5" />
                          โหมดจำลอง
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {omiseLive
                        ? 'PromptPay / บัตร ผ่าน Omise · แพ็ก 20–310 หน่วย'
                        : 'Demo — ไม่มีการชำระเงินจริง · แพ็ก 20–310 หน่วย'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsTopUpModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-purple-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  เลือกแพ็กเกจ
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-xs font-bold text-purple-100">3. แพ็กเกจเติมเครดิต</div>
                  <div className="text-[10px] text-slate-400">
                    ตั้งค่า OMISE_SECRET_KEY / OMISE_PUBLIC_KEY เพื่อเปิดชำระเงิน
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Option 4: Admin note */}
          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 flex items-start gap-1.5 text-[11px] text-purple-300">
            <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <span>
              4. ระบบ Admin ใช้เฉพาะเจ้าหน้าที่ (ต้องมีโทเคน) — ผู้ใช้ทั่วไปไม่สามารถรีเซ็ตหรือเติมด่วนได้ใน
              production
            </span>
          </div>
        </div>

        {/* Footer Action */}
        <div className="flex justify-end border-t border-amber-500/20 pt-3">
          <button
            type="button"
            onClick={() => {
              void refreshCredits();
              onClose();
            }}
            className="px-5 py-2 min-h-[40px] rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            ปิด
          </button>
        </div>
      </ModalShell>

      {showPaidTopup && (
        <TopUpSimulatorModal
          isOpen={isTopUpModalOpen}
          onClose={() => setIsTopUpModalOpen(false)}
          onSuccess={(newCredits) => applyCredits(newCredits)}
        />
      )}
    </>
  );
};
