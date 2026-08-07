import React, { useState, useEffect, useCallback } from 'react';
import {
  Coins,
  X,
  Gift,
  Ticket,
  CreditCard,
  Zap,
  Loader2,
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient, ApiError } from '../../services/apiClient';
import { TopUpModal } from './TopUpModal';
import { ModalShell } from '../common/ModalShell';
import type { TopupReturnResult } from '../../services/topupReturn';

interface CreditCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** After 3DS/OTP bank redirect — show status banner */
  returnResult?: TopupReturnResult | null;
  onDismissReturnResult?: () => void;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'พร้อมรับแล้ว';
  const totalMin = Math.ceil(ms / 60000);
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (hours <= 0) return `อีก ${mins} นาที`;
  return `อีก ${hours} ชม. ${mins} นาที`;
}

export const CreditCenterModal: React.FC<CreditCenterModalProps> = ({
  isOpen,
  onClose,
  returnResult = null,
  onDismissReturnResult,
}) => {
  const { credits: authCredits, updateCredits, features, refreshFeatures } = useAuth();
  const [credits, setCredits] = useState<number | null>(authCredits);
  const [loadingCredits, setLoadingCredits] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoMsg, setPromoMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [dailyMsg, setDailyMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [fastRefillMsg, setFastRefillMsg] = useState<{ success: boolean; text: string } | null>(
    null
  );

  const [canClaimDaily, setCanClaimDaily] = useState(true);
  const [nextDailyMs, setNextDailyMs] = useState(0);
  const [claimingDaily, setClaimingDaily] = useState(false);
  const [redeemingPromo, setRedeemingPromo] = useState(false);
  const [fastRefilling, setFastRefilling] = useState(false);

  const showFastRefill = Boolean(features?.fastRefill && !features?.isProduction);
  const omiseLive = Boolean(features?.omisePayments);
  const simulatorOnly = Boolean(features?.topupSimulator && !omiseLive);
  const showPaidTopup = Boolean(
    features?.paidTopup ?? features?.omisePayments ?? features?.topupSimulator
  );

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
      /* keep previous */
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
    if (!isOpen) {
      // Reset nested top-up when credit center fully closes
      setIsTopUpModalOpen(false);
      return;
    }
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

  // Apply balance from 3DS return resolve
  useEffect(() => {
    if (!isOpen || !returnResult) return;
    if (
      returnResult.status === 'fulfilled' &&
      typeof returnResult.creditsBalance === 'number'
    ) {
      applyCredits(returnResult.creditsBalance);
    }
  }, [isOpen, returnResult, applyCredits]);

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
          text: data.message || 'รับโบนัสวันนี้สำเร็จ (+10)!',
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
            : 'โค้ดไม่ถูกต้องหรือใช้ไปแล้ว';
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
        setFastRefillMsg({ success: true, text: '+10 เติมสำเร็จ' });
        setTimeout(() => setFastRefillMsg(null), 2000);
      }
    } catch (err: unknown) {
      setFastRefillMsg({
        success: false,
        text: err instanceof ApiError ? err.message : 'เติมด่วนไม่สำเร็จ',
      });
    } finally {
      setFastRefilling(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      {/*
        Hide credit shell while top-up is open — avoids double backdrop-blur
        (stacked bg-black/80 + blur = visible flash/"กะพริบ").
      */}
      <ModalShell
        isOpen={isOpen && !isTopUpModalOpen}
        onClose={handleClose}
        titleId="credit-center-title"
        maxWidthClass="max-w-lg"
        panelClassName="glass-panel-gold rounded-2xl p-6 border border-amber-400/50 shadow-2xl"
        align="center"
      >
        {/* Header — close via X only */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-3 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 shrink-0">
              <Coins className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 id="credit-center-title" className="text-base font-bold text-amber-100">
                เครดิต AI
              </h3>
              <p className="text-[11px] text-slate-400 leading-snug">
                ใช้ตอนขอคำทำนายด้วย AI · หมดแล้วยังอ่านแบบมาตรฐานได้
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="ปิด"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* 3DS / OTP return banner */}
        {returnResult && (
          <div
            className={`mb-4 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-[11px] leading-relaxed ${
              returnResult.status === 'fulfilled'
                ? 'border-emerald-400/40 bg-emerald-950/40 text-emerald-100'
                : returnResult.status === 'checking'
                  ? 'border-amber-400/40 bg-amber-950/40 text-amber-100'
                  : returnResult.status === 'pending'
                    ? 'border-amber-400/40 bg-amber-950/30 text-amber-100'
                    : 'border-rose-400/40 bg-rose-950/40 text-rose-100'
            }`}
            role="status"
          >
            {returnResult.status === 'fulfilled' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
            ) : returnResult.status === 'checking' ? (
              <Loader2 className="w-4 h-4 text-amber-300 shrink-0 mt-0.5 animate-spin" aria-hidden="true" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" aria-hidden="true" />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {returnResult.status === 'fulfilled'
                  ? 'กลับจากการยืนยันธนาคาร'
                  : returnResult.status === 'checking'
                    ? 'กำลังตรวจสอบการชำระเงิน…'
                    : 'ผลการชำระเงิน'}
              </p>
              <p className="mt-0.5 opacity-90">{returnResult.message}</p>
              {returnResult.packageName && (
                <p className="mt-0.5 text-[10px] opacity-70">{returnResult.packageName}</p>
              )}
            </div>
            {returnResult.status !== 'checking' && onDismissReturnResult && (
              <button
                type="button"
                onClick={onDismissReturnResult}
                className="text-[10px] font-semibold underline opacity-80 hover:opacity-100 shrink-0 cursor-pointer"
              >
                ปิด
              </button>
            )}
          </div>
        )}

        {/* Balance */}
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
                <p className="text-[11px] text-rose-300/90 mt-0.5">เครดิตหมด — เติมด้านล่างได้</p>
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
              title="เติมด่วน (โหมดพัฒนา)"
            >
              {fastRefilling ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Zap className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              )}
              <span>Dev +10</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 mb-1">
          {/* Primary: buy packages */}
          {showPaidTopup && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-purple-950/60 to-purple-950/40 border border-amber-400/50 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <CreditCard className="w-5 h-5 text-amber-300 shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-amber-100 flex items-center gap-1.5 flex-wrap">
                    ซื้อแพ็กเกจ
                    {simulatorOnly && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-fuchsia-500/25 border border-fuchsia-400/40 text-fuchsia-200">
                        <FlaskConical className="w-2.5 h-2.5" aria-hidden="true" />
                        จำลอง
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {omiseLive
                      ? 'PromptPay / บัตร · แพ็ก 60–600 หน่วย'
                      : 'ทดสอบ UI — ไม่ตัดเงินจริง'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTopUpModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-purple-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                เลือกแพ็ก
              </button>
            </div>
          )}

          {/* Daily bonus */}
          <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Gift className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                <span className="text-xs font-bold text-purple-100">โบนัสรายวัน</span>
              </div>
              <button
                type="button"
                onClick={handleClaimDailyBonus}
                disabled={claimingDaily || !canClaimDaily}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shrink-0"
              >
                {claimingDaily && <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />}
                {canClaimDaily ? 'รับฟรี +10' : formatCountdown(nextDailyMs)}
              </button>
            </div>
            {!canClaimDaily && !dailyMsg && (
              <p className="text-[11px] text-slate-500">
                รับแล้ว — รอ {formatCountdown(nextDailyMs)}
              </p>
            )}
            {dailyMsg && (
              <p
                className={`text-[11px] ${
                  dailyMsg.success ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {dailyMsg.text}
              </p>
            )}
          </div>

          {/* Promo code */}
          <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
              <span className="text-xs font-bold text-purple-100">โค้ดโปรโมชัน</span>
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
                aria-label="โค้ดโปรโมชัน"
                placeholder="กรอกโค้ดของคุณ"
                className="flex-1 px-3 py-1.5 rounded-lg bg-black/50 border border-purple-500/40 text-xs text-amber-200 placeholder-slate-500 uppercase font-mono focus:outline-none focus-visible:border-amber-400 focus-visible:ring-1 focus-visible:ring-amber-400/40 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={redeemingPromo || !promoCodeInput.trim()}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-purple-950 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1 shrink-0"
              >
                {redeemingPromo && <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />}
                ใช้โค้ด
              </button>
            </form>
            {promoMsg && (
              <p
                className={`text-[11px] ${
                  promoMsg.success ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {promoMsg.text}
              </p>
            )}
          </div>
        </div>
      </ModalShell>

      {showPaidTopup && (
        <TopUpModal
          isOpen={isOpen && isTopUpModalOpen}
          onClose={() => setIsTopUpModalOpen(false)}
          onSuccess={(newCredits) => applyCredits(newCredits)}
        />
      )}
    </>
  );
};
