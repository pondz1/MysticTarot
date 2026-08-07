import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Coins,
  X,
  Check,
  QrCode,
  CreditCard,
  Sparkles,
  CheckCircle2,
  Zap,
  FlaskConical,
  AlertTriangle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { apiClient, ApiError } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import { ModalShell } from '../common/ModalShell';
import {
  createOmiseCardToken,
  detectCardBrand,
  formatCardExpiry,
  formatCardNumber,
  formatCvc,
  parseCardExpiry,
  validateCardFields,
} from '../../services/omiseClient';
import { savePendingTopup } from '../../services/topupReturn';

export interface TopUpPackage {
  id: string;
  name: string;
  baseCredits: number;
  bonusCredits: number;
  priceThb: number;
  badge?: string;
  tagline?: string;
  popular?: boolean;
}

/** Keep in sync with server/src/constants/topupPackages.ts */
const FALLBACK_PACKAGES: TopUpPackage[] = [
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

/** Omise PromptPay minimum (THB) — matches server payments route */
const PROMPTPAY_MIN_THB = 20;

function packTotalCredits(pkg: TopUpPackage): number {
  return pkg.baseCredits + pkg.bonusCredits;
}

/** List price if bought at Starter unit rate — for savings / anchor framing */
function listPriceVsStarter(pkg: TopUpPackage, starter: TopUpPackage | undefined): number {
  if (!starter) return pkg.priceThb;
  const starterTotal = packTotalCredits(starter);
  if (starterTotal <= 0) return pkg.priceThb;
  const unit = starter.priceThb / starterTotal;
  return Math.round(packTotalCredits(pkg) * unit);
}

function savePercent(pkg: TopUpPackage, listPrice: number): number {
  if (listPrice <= pkg.priceThb) return 0;
  return Math.round(((listPrice - pkg.priceThb) / listPrice) * 100);
}
interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newCredits: number) => void;
}

type PayMethod = 'promptpay' | 'card';

interface PendingPayment {
  orderId: string;
  chargeId?: string | null;
  qrImageUrl?: string | null;
  credits: number;
  packageName: string;
  priceThb: number;
  method: PayMethod;
  testMode?: boolean;
  dashboardChargeUrl?: string | null;
}

/** Credit package purchase (Omise PromptPay/card, or demo simulate when Omise is off). */
export const TopUpModal: React.FC<TopUpModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { updateCredits, features } = useAuth();
  const [packages, setPackages] = useState<TopUpPackage[]>(FALLBACK_PACKAGES);
  const [selectedPkg, setSelectedPkg] = useState<TopUpPackage | null>(
    FALLBACK_PACKAGES.find((p) => p.popular) || FALLBACK_PACKAGES[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<PayMethod>('promptpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ added: number; total: number } | null>(null);
  const [pending, setPending] = useState<PendingPayment | null>(null);
  const [pollHint, setPollHint] = useState('รอการชำระเงิน…');
  /** Live flags from /packages (authoritative) so we don't stick on AuthContext demo defaults */
  const [liveFlags, setLiveFlags] = useState<{
    omisePayments?: boolean;
    topupSimulator?: boolean;
    omisePublicKey?: string | null;
    omiseTestMode?: boolean;
  } | null>(null);

  // Card fields (tokenized client-side via Omise.js — never sent raw to our server)
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState(''); // MM/YY
  const [cardCvc, setCardCvc] = useState('');
  const [cardFieldError, setCardFieldError] = useState<string | null>(null);

  const omiseEnabled = Boolean(
    liveFlags?.omisePayments ?? features?.omisePayments
  );
  const simulatorEnabled = Boolean(
    liveFlags?.topupSimulator ?? features?.topupSimulator
  );
  const publicKey =
    liveFlags?.omisePublicKey ?? features?.omisePublicKey ?? null;
  const isOmiseTest =
    liveFlags?.omiseTestMode ?? features?.omiseTestMode ?? publicKey?.includes('_test_') ?? false;
  const cardBrand = detectCardBrand(cardNumber);
  const pollRef = useRef<number | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current != null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopPolling();
      return;
    }
    setErrorMsg(null);
    setSuccessInfo(null);
    setPending(null);
    setCardFieldError(null);
    // Keep showing cached/fallback packages — soft refresh, no loading spinner flicker
    let cancelled = false;

    apiClient
      .get<{
        packages: TopUpPackage[];
        features?: {
          topupSimulator?: boolean;
          omisePayments?: boolean;
          omisePublicKey?: string | null;
          omiseTestMode?: boolean;
        };
      }>('/api/user/packages')
      .then((res) => {
        if (cancelled) return;
        if (res.features) {
          setLiveFlags(res.features);
        }
        if (Array.isArray(res.packages) && res.packages.length > 0) {
          const pkgs = res.packages as TopUpPackage[];
          setPackages(pkgs);
          setSelectedPkg((prev) => {
            const popular = pkgs.find((p: TopUpPackage) => p.popular);
            if (prev && pkgs.some((p: TopUpPackage) => p.id === prev.id)) return prev;
            return popular || pkgs[0];
          });
        }
      })
      .catch((err) => console.warn('Failed to fetch packages:', err));

    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [isOpen, stopPolling]);

  const finishSuccess = useCallback(
    (added: number, total: number) => {
      stopPolling();
      setPending(null);
      setSuccessInfo({ added, total });
      updateCredits(total);
      onSuccess?.(total);
    },
    [onSuccess, stopPolling, updateCredits]
  );

  const startPolling = useCallback(
    (orderId: string, expectedCredits: number) => {
      stopPolling();
      // Static hint — do NOT toggle text every tick (causes modal scroll jump)
      setPollHint('รอการยืนยันการชำระเงิน…');
      pollRef.current = window.setInterval(async () => {
        try {
          const res = await apiClient.get<{
            status: string;
            newlyFulfilled?: boolean;
            creditsBalance?: number;
            credits?: number;
            failureMessage?: string | null;
          }>(`/api/user/topup/${orderId}/status`);

          if (res.status === 'fulfilled' || res.status === 'successful') {
            const total =
              typeof res.creditsBalance === 'number'
                ? res.creditsBalance
                : expectedCredits;
            const added = typeof res.credits === 'number' ? res.credits : expectedCredits;
            finishSuccess(added, total);
            return;
          }
          if (res.status === 'failed' || res.status === 'expired') {
            stopPolling();
            setPending(null);
            setErrorMsg(res.failureMessage || 'การชำระเงินล้มเหลวหรือหมดเวลา');
            setIsProcessing(false);
          }
          // pending: no setState — avoid re-render/scroll thrash every 3s
        } catch {
          // keep polling silently
        }
      }, 3000);
    },
    [finishSuccess, stopPolling]
  );

  const totalCredits =
    (selectedPkg?.baseCredits || 0) + (selectedPkg?.bonusCredits || 0);

  const promptPayAllowed =
    (selectedPkg?.priceThb ?? 0) >= PROMPTPAY_MIN_THB;

  const selectPackage = (pkg: TopUpPackage) => {
    setSelectedPkg(pkg);
    // Omise PromptPay minimum ฿20 — force card on cheaper packs
    if (pkg.priceThb < PROMPTPAY_MIN_THB && paymentMethod === 'promptpay') {
      setPaymentMethod('card');
    }
  };

  const handleOmisePay = async () => {
    if (!selectedPkg || isProcessing || !omiseEnabled) return;
    if (paymentMethod === 'promptpay' && selectedPkg.priceThb < PROMPTPAY_MIN_THB) {
      setErrorMsg(`แพ็กนี้ใช้บัตรเท่านั้น (PromptPay ขั้นต่ำ ฿${PROMPTPAY_MIN_THB})`);
      setPaymentMethod('card');
      return;
    }
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      let omiseToken: string | undefined;

      if (paymentMethod === 'card') {
        if (!publicKey) {
          throw new Error('ยังไม่ได้ตั้งค่าคีย์ชำระเงิน (public key)');
        }
        const fieldErr = validateCardFields({
          name: cardName,
          number: cardNumber,
          exp: cardExp,
          cvc: cardCvc,
        });
        if (fieldErr) {
          setCardFieldError(fieldErr);
          setIsProcessing(false);
          return;
        }
        const exp = parseCardExpiry(cardExp);
        if (!exp) {
          setCardFieldError('วันหมดอายุไม่ถูกต้อง (ใช้รูปแบบ MM/YY)');
          setIsProcessing(false);
          return;
        }
        setCardFieldError(null);
        omiseToken = await createOmiseCardToken(publicKey, {
          name: cardName.trim(),
          number: cardNumber.replace(/\D/g, ''),
          expiration_month: exp.month,
          expiration_year: exp.year,
          security_code: cardCvc.replace(/\D/g, ''),
        });
      }

      const res = await apiClient.post<{
        orderId: string;
        chargeId?: string;
        status: string;
        qrImageUrl?: string | null;
        authorizeUri?: string | null;
        credits: number;
        packageName: string;
        priceThb: number;
        creditsBalance?: number;
        newlyFulfilled?: boolean;
        testMode?: boolean;
        dashboardChargeUrl?: string | null;
      }>('/api/user/topup/create', {
        packageId: selectedPkg.id,
        method: paymentMethod,
        omiseToken,
        // Server merges order id into return URL for 3DS resume
        returnUri: `${window.location.origin}/`,
      });

      if (res.status === 'fulfilled' || res.newlyFulfilled) {
        finishSuccess(
          res.credits,
          typeof res.creditsBalance === 'number' ? res.creditsBalance : res.credits
        );
        setIsProcessing(false);
        return;
      }

      if (res.authorizeUri) {
        // Stash order before leaving — backup if return URL drops query params
        savePendingTopup({
          orderId: res.orderId,
          packageName: res.packageName,
          credits: res.credits,
          chargeId: res.chargeId,
        });
        // 3-D Secure / bank OTP page (Omise)
        window.location.href = res.authorizeUri;
        return;
      }

      setPending({
        orderId: res.orderId,
        chargeId: res.chargeId,
        // Must be full Omise download_uri — relative /api/... paths break in <img> (no JWT)
        qrImageUrl: res.qrImageUrl,
        credits: res.credits,
        packageName: res.packageName,
        priceThb: res.priceThb,
        method: paymentMethod,
        testMode: res.testMode,
        dashboardChargeUrl: res.dashboardChargeUrl,
      });
      startPolling(res.orderId, res.credits);
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'ชำระเงินไม่สำเร็จ';
      setErrorMsg(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!selectedPkg || isProcessing || !simulatorEnabled) return;
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await apiClient.post<{
        credits: number;
        added: number;
      }>('/api/user/topup-simulate', { packageId: selectedPkg.id });

      if (typeof res.credits === 'number') {
        const actualAdded = typeof res.added === 'number' ? res.added : totalCredits;
        finishSuccess(actualAdded, res.credits);
      }
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'ไม่สามารถจำลองการเติมเครดิตได้';
      setErrorMsg(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    stopPolling();
    setSuccessInfo(null);
    setErrorMsg(null);
    setPending(null);
    onClose();
  };

  const modeLabel = omiseEnabled ? 'Omise' : simulatorEnabled ? 'DEMO' : 'ปิด';

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      titleId="topup-modal-title"
      maxWidthClass="max-w-lg"
      zClass="z-[60]"
      align="center"
      panelClassName="glass-panel-gold rounded-2xl p-6 border border-amber-400/50 shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-amber-500/30 pb-3 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 shrink-0">
            <Coins className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3
              id="topup-modal-title"
              className="text-base font-bold text-amber-100 flex items-center gap-2 flex-wrap"
            >
              แพ็กเกจเติมเครดิต AI
              <span
                className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                  omiseEnabled
                    ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                    : 'bg-fuchsia-500/25 border-fuchsia-400/40 text-fuchsia-200'
                }`}
              >
                {omiseEnabled ? <ShieldCheck className="w-3 h-3" /> : <FlaskConical className="w-3 h-3" />}
                {modeLabel}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {omiseEnabled
                ? 'ชำระเงินผ่าน Omise (PromptPay / บัตร)'
                : 'โหมดจำลอง — ไม่มีการชำระเงินจริง'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClose}
          aria-label="ปิดหน้าต่างเติมเครดิต"
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {!omiseEnabled && simulatorEnabled && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-fuchsia-400/40 bg-fuchsia-950/40 px-3 py-2.5 text-[11px] text-fuchsia-100 leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-fuchsia-300 shrink-0 mt-0.5" />
          <div>
            <strong className="text-fuchsia-200">โหมดจำลอง</strong>
            <br />
            ยังไม่ได้ตั้งค่า OMISE_SECRET_KEY — กดยืนยันแล้วเครดิตจะเพิ่มทันทีโดยไม่ตัดเงิน
          </div>
        </div>
      )}

      {omiseEnabled && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-400/30 bg-emerald-950/30 px-3 py-2.5 text-[11px] text-emerald-100/90 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
          <div>
            ชำระเงินปลอดภัยผ่าน <strong>Omise</strong> — ข้อมูลบัตรถูก tokenize ที่เบราว์เซอร์
            ไม่ถูกส่งมายังเซิร์ฟเวอร์ของเรา
          </div>
        </div>
      )}

      {!omiseEnabled && !simulatorEnabled && (
        <div className="py-8 text-center text-sm text-slate-400">
          ระบบเติมเครดิตยังไม่พร้อม กรุณาตั้งค่า Omise หรือเปิด simulator
        </div>
      )}

      {successInfo ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h4 className="text-xl font-bold text-emerald-300 font-serif-mystic mb-1">
            {omiseEnabled ? 'ชำระเงินสำเร็จ!' : 'จำลองการเติมสำเร็จ!'}
          </h4>
          <p className="text-xs text-purple-200 mb-4">
            เพิ่มเข้าสู่บัญชีแล้ว{' '}
            <span className="text-amber-300 font-bold">+{successInfo.added} Credits</span>
          </p>
          <div className="w-full bg-purple-950/80 border border-amber-400/40 rounded-xl p-4 mb-6">
            <div className="text-xs text-purple-300 mb-1">ยอด Credit คงเหลือทั้งหมด</div>
            <div className="text-3xl font-extrabold text-amber-300 font-serif-mystic">
              {successInfo.total} CR
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-purple-950 font-bold text-sm cursor-pointer"
          >
            ตกลง และ เริ่มทำนายดวงชะตา
          </button>
        </div>
      ) : pending ? (
        <div className="flex flex-col items-center py-4 text-center">
          <h4 className="text-sm font-bold text-amber-100 mb-1">
            {pending.method === 'promptpay' ? 'สแกน PromptPay QR' : 'รอการยืนยันการชำระเงิน'}
          </h4>
          <p className="text-[11px] text-slate-400 mb-3">
            {pending.packageName} · ฿{pending.priceThb} · +{pending.credits} CR
          </p>

          {pending.testMode && pending.method === 'promptpay' && (
            <div className="w-full mb-3 text-left flex items-start gap-2 rounded-xl border border-amber-400/50 bg-amber-950/40 px-3 py-2.5 text-[11px] text-amber-100 leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-200">โหมด Test ของ Omise</strong>
                <br />
                สแกนด้วยแอปธนาคารจริง<strong> จะไม่ตัดเงินและไม่สำเร็จ</strong> — เป็น QR ทดสอบเท่านั้น
                <ol className="list-decimal ml-4 mt-1.5 space-y-0.5 text-amber-100/90">
                  <li>เปิด Omise Dashboard → Charges</li>
                  <li>หา charge นี้ แล้วกด Actions → Mark as successful</li>
                  <li>กลับมาหน้านี้ กด «ตรวจสอบสถานะ»</li>
                </ol>
                {pending.dashboardChargeUrl && (
                  <a
                    href={pending.dashboardChargeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-amber-300 underline font-semibold"
                  >
                    เปิด charge บน Dashboard →
                  </a>
                )}
                {pending.chargeId && (
                  <div className="mt-1 font-mono text-[10px] text-slate-400 break-all">
                    {pending.chargeId}
                  </div>
                )}
              </div>
            </div>
          )}

          {pending.qrImageUrl ? (
            <div
              className="w-full max-w-[300px] aspect-[2/3] bg-white rounded-2xl shadow-lg mb-3 p-4 flex items-center justify-center"
              aria-label="PromptPay QR ขนาด 2:3"
            >
              {/* Do NOT set crossOrigin — Omise has no CORS; QR stays square (object-contain) inside 2:3 frame */}
              <img
                src={pending.qrImageUrl}
                alt="PromptPay QR Code"
                className="w-full h-full max-w-full max-h-full object-contain object-center bg-white select-none"
                referrerPolicy="no-referrer"
                draggable={false}
                onError={(e) => {
                  console.error('[TopUp] QR image failed to load:', pending.qrImageUrl);
                  (e.target as HTMLImageElement).style.outline = '2px solid #f43f5e';
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 mb-3 w-full max-w-[300px] aspect-[2/3] justify-center rounded-2xl border border-dashed border-amber-500/30">
              <Loader2 className="w-10 h-10 text-amber-300 animate-spin" />
              <p className="text-[11px] text-rose-300">ไม่ได้รับ URL ของ QR จาก Omise</p>
            </div>
          )}
          <p className="text-xs text-emerald-300 flex items-center justify-center gap-1.5 mb-2 min-h-[1.25rem]">
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" aria-hidden="true" />
            <span className="tabular-nums">
              {pending.testMode ? 'รอ mark successful บน Dashboard…' : pollHint}
            </span>
          </p>
          {!pending.testMode && (
            <p className="text-[10px] text-slate-500 mb-3 max-w-xs">
              มือถือ: ถ่าย screenshot QR แล้วเปิดในแอปธนาคาร · เดสก์ท็อป: สแกนด้วยแอปบนโทรศัพท์
            </p>
          )}
          <button
            type="button"
            onClick={async () => {
              try {
                const res = await apiClient.get<{
                  status: string;
                  creditsBalance?: number;
                  credits?: number;
                  failureMessage?: string | null;
                }>(`/api/user/topup/${pending.orderId}/status`);
                if (res.status === 'fulfilled' || res.status === 'successful') {
                  finishSuccess(
                    res.credits ?? pending.credits,
                    res.creditsBalance ?? pending.credits
                  );
                } else if (res.status === 'failed' || res.status === 'expired') {
                  setErrorMsg(res.failureMessage || 'การชำระเงินล้มเหลว');
                  setPending(null);
                  stopPolling();
                } else {
                  setPollHint('ยังรอชำระ… ลองใหม่หลัง mark successful');
                }
              } catch {
                /* ignore */
              }
            }}
            className="px-4 py-2 rounded-lg text-xs font-semibold border border-amber-400/40 text-amber-200 hover:bg-slate-800 cursor-pointer"
          >
            ตรวจสอบสถานะทันที
          </button>
          {errorMsg && (
            <p className="mt-3 text-[11px] text-rose-300">{errorMsg}</p>
          )}
        </div>
      ) : (
        (omiseEnabled || simulatorEnabled) && (
          <>
            <div className="mb-5">
              <label className="text-xs text-purple-200 font-semibold mb-2 block flex items-center justify-between gap-2">
                <span>1. เลือกแพ็กเกจ</span>
                <span className="text-[10px] text-amber-300/80 shrink-0">หักตามการใช้งานจริง</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {(() => {
                  const starterPkg =
                    packages.find((p) => p.id === 'pkg_starter') || packages[0];
                  return packages.map((pkg) => {
                    const isSelected = selectedPkg?.id === pkg.id;
                    const total = packTotalCredits(pkg);
                    const listPrice = listPriceVsStarter(pkg, starterPkg);
                    const savePct = savePercent(pkg, listPrice);
                    const isPopular = Boolean(pkg.popular);

                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => selectPackage(pkg)}
                        className={`relative flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? isPopular
                              ? 'bg-gradient-to-br from-amber-500/25 to-orange-600/15 border-amber-400 shadow-lg shadow-amber-500/25 ring-1 ring-amber-300/40'
                              : 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/20'
                            : isPopular
                              ? 'bg-gradient-to-br from-amber-500/10 to-purple-950/50 border-amber-400/50 hover:border-amber-400 hover:shadow-md hover:shadow-amber-500/15'
                              : 'bg-purple-950/40 border-purple-500/20 hover:bg-purple-900/40'
                        }`}
                      >
                        {pkg.badge && (
                          <span
                            className={`absolute -top-2 right-2 text-[9px] px-2 py-0.5 rounded-full font-bold shadow-sm ${
                              isPopular
                                ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-purple-950'
                                : 'bg-amber-500 text-purple-950'
                            }`}
                          >
                            {pkg.badge}
                          </span>
                        )}
                        <div className="flex items-center justify-between mb-0.5 pr-1">
                          <span className="text-xs font-bold text-purple-100">{pkg.name}</span>
                          {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                        </div>

                        {/* Price first (left-digit / charm) — largest visual weight */}
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xl font-black text-amber-300 tabular-nums tracking-tight">
                            ฿{pkg.priceThb}
                          </span>
                          {savePct >= 8 && (
                            <span className="text-[10px] font-bold text-emerald-400">
                              คุ้มกว่า {savePct}%
                            </span>
                          )}
                        </div>
                        {savePct >= 8 && listPrice > pkg.priceThb && (
                          <div className="text-[10px] text-slate-500 line-through tabular-nums">
                            มูลค่าเทียบ ฿{listPrice}
                          </div>
                        )}

                        <div className="mt-1.5 text-sm font-extrabold text-purple-50 font-serif-mystic">
                          {total.toLocaleString('th-TH')}{' '}
                          <span className="text-[11px] font-normal text-purple-300">Credits</span>
                        </div>
                        {pkg.bonusCredits > 0 && (
                          <div className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
                            <Sparkles className="w-3 h-3" />
                            โบนัส +{pkg.bonusCredits} CR
                            {pkg.baseCredits > 0 && (
                              <span className="text-emerald-500/70">
                                (+
                                {Math.round((pkg.bonusCredits / pkg.baseCredits) * 100)}
                                %)
                              </span>
                            )}
                          </div>
                        )}
                        {pkg.tagline && (
                          <div className="mt-1.5 text-[10px] text-purple-300/80 leading-snug border-t border-purple-800/40 pt-1.5">
                            {pkg.tagline}
                          </div>
                        )}
                      </button>
                    );
                  });
                })()}
              </div>
              <p className="mt-2.5 text-[10px] text-slate-500 text-center leading-relaxed px-1">
                เครดิตหักตามปริมาณงาน AI จริง ไม่ใช่เหมาจ่ายต่อครั้ง · งานสั้นใช้ไม่กี่หน่วย
                งานยาวใช้มากขึ้น · เครดิตไม่หมดอายุ
              </p>
            </div>

            <div className="mb-5">
              <label className="text-xs text-purple-200 font-semibold mb-2 block">
                2. ช่องทางชำระเงิน
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    if (promptPayAllowed) setPaymentMethod('promptpay');
                  }}
                  disabled={!promptPayAllowed}
                  title={
                    promptPayAllowed
                      ? 'ชำระด้วย PromptPay QR'
                      : `PromptPay ขั้นต่ำ ฿${PROMPTPAY_MIN_THB} — ใช้บัตรสำหรับแพ็กนี้`
                  }
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold ${
                    !promptPayAllowed
                      ? 'opacity-40 cursor-not-allowed bg-purple-950/30 border-purple-800/30 text-purple-500'
                      : paymentMethod === 'promptpay'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 cursor-pointer'
                        : 'bg-purple-950/40 border-purple-500/20 text-purple-300 cursor-pointer'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-amber-400" />
                  PromptPay
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-purple-950/40 border-purple-500/20 text-purple-300'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  บัตรเครดิต/เดบิต
                </button>
              </div>
              {!promptPayAllowed && selectedPkg && (
                <p className="text-[10px] text-amber-200/80 mb-3 -mt-1">
                  แพ็ก ฿{selectedPkg.priceThb} ใช้บัตรเท่านั้น (PromptPay ขั้นต่ำ ฿
                  {PROMPTPAY_MIN_THB})
                </p>
              )}

              {omiseEnabled && paymentMethod === 'card' && (
                <div className="p-3.5 rounded-xl bg-purple-950/80 border border-amber-500/30 flex flex-col gap-3">
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    ข้อมูลบัตรถูกเข้ารหัสที่เบราว์เซอร์ผ่าน Omise — ไม่ถูกส่งไปเซิร์ฟเวอร์ของเรา
                  </p>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="card-name" className="text-[11px] font-medium text-purple-200">
                      ชื่อบนบัตร
                    </label>
                    <input
                      id="card-name"
                      name="cc-name"
                      type="text"
                      autoComplete="cc-name"
                      autoCapitalize="characters"
                      spellCheck={false}
                      placeholder="NAME SURNAME"
                      value={cardName}
                      onChange={(e) => {
                        setCardName(e.target.value);
                        setCardFieldError(null);
                      }}
                      disabled={isProcessing}
                      className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-purple-500/40 text-sm text-amber-100 placeholder-slate-500 focus:outline-none focus-visible:border-amber-400 focus-visible:ring-1 focus-visible:ring-amber-400/40 disabled:opacity-50"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <label htmlFor="card-number" className="text-[11px] font-medium text-purple-200">
                        หมายเลขบัตร
                      </label>
                      {cardNumber.replace(/\D/g, '').length >= 1 && (
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            cardBrand.id === 'unknown'
                              ? 'border-slate-600 text-slate-400 bg-slate-900/60'
                              : 'border-amber-400/40 text-amber-100 bg-amber-500/15'
                          }`}
                          aria-live="polite"
                        >
                          <CreditCard className="w-3 h-3 shrink-0" aria-hidden="true" />
                          {cardBrand.label}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        id="card-number"
                        name="cc-number"
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-number"
                        spellCheck={false}
                        placeholder="ACCT-000003"
                        value={cardNumber}
                        onChange={(e) => {
                          setCardNumber(formatCardNumber(e.target.value));
                          setCardFieldError(null);
                        }}
                        disabled={isProcessing}
                        maxLength={cardBrand.id === 'amex' ? 17 : 23}
                        className="w-full px-3 py-2.5 pr-16 rounded-lg bg-black/40 border border-purple-500/40 text-sm text-amber-100 placeholder-slate-500 focus:outline-none focus-visible:border-amber-400 focus-visible:ring-1 focus-visible:ring-amber-400/40 font-mono tracking-wider disabled:opacity-50"
                      />
                      {cardBrand.id !== 'unknown' && cardNumber.replace(/\D/g, '').length >= 2 && (
                        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-extrabold tracking-tight text-amber-300/90 uppercase">
                          {cardBrand.id === 'mastercard'
                            ? 'MC'
                            : cardBrand.id === 'amex'
                              ? 'AMEX'
                              : cardBrand.id === 'unionpay'
                                ? 'UP'
                                : cardBrand.id}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="card-exp" className="text-[11px] font-medium text-purple-200">
                        หมดอายุ
                      </label>
                      <input
                        id="card-exp"
                        name="cc-exp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        placeholder="MM/YY"
                        value={cardExp}
                        onChange={(e) => {
                          setCardExp(formatCardExpiry(e.target.value));
                          setCardFieldError(null);
                        }}
                        disabled={isProcessing}
                        maxLength={5}
                        className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-purple-500/40 text-sm text-amber-100 placeholder-slate-500 focus:outline-none focus-visible:border-amber-400 focus-visible:ring-1 focus-visible:ring-amber-400/40 font-mono disabled:opacity-50"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="card-cvc" className="text-[11px] font-medium text-purple-200">
                        {cardBrand.id === 'amex' ? 'CID' : 'CVC'}
                      </label>
                      <input
                        id="card-cvc"
                        name="cc-csc"
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        placeholder={cardBrand.id === 'amex' ? '1234' : '123'}
                        value={cardCvc}
                        onChange={(e) => {
                          setCardCvc(formatCvc(e.target.value).slice(0, cardBrand.cvcLength));
                          setCardFieldError(null);
                        }}
                        disabled={isProcessing}
                        maxLength={cardBrand.cvcLength}
                        className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-purple-500/40 text-sm text-amber-100 placeholder-slate-500 focus:outline-none focus-visible:border-amber-400 focus-visible:ring-1 focus-visible:ring-amber-400/40 font-mono disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {cardFieldError && (
                    <p className="text-[11px] text-rose-300" role="alert">
                      {cardFieldError}
                    </p>
                  )}

                  {isOmiseTest && (
                    <p className="text-[10px] text-amber-200/80 bg-amber-950/40 border border-amber-500/25 rounded-lg px-2.5 py-2 leading-relaxed">
                      <strong className="text-amber-200">โหมดทดสอบ</strong>
                      <br />
                      บัตร: 4242 4242 4242 4242 · หมดอายุอนาคต เช่น 12/30 · CVC 123
                    </p>
                  )}
                </div>
              )}

              {!omiseEnabled && paymentMethod === 'card' && (
                <div className="p-3 rounded-xl bg-purple-950/60 border border-fuchsia-500/25 text-[11px] text-fuchsia-200/90">
                  โหมดจำลองยังไม่รองรับกรอกบัตรจริง — เลือก PromptPay แล้วกดจำลองเติม หรือตั้งค่า Omise
                </div>
              )}

              {omiseEnabled && paymentMethod === 'promptpay' && (
                <div className="p-3 rounded-xl bg-purple-950/60 border border-amber-500/20 text-[11px] text-purple-200 leading-relaxed">
                  กดชำระแล้วจะแสดง QR PromptPay ให้สแกนด้วยแอปธนาคาร
                  {isOmiseTest && (
                    <span className="block mt-1 text-amber-200/80">
                      Test mode: สแกนแอปจริงไม่ติด — mark successful บน Dashboard
                    </span>
                  )}
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="mb-3 text-[11px] px-2.5 py-2 rounded-md bg-rose-500/20 text-rose-300 border border-rose-400/30">
                {errorMsg}
              </div>
            )}

            <button
              type="button"
              onClick={omiseEnabled ? handleOmisePay : handleSimulatePayment}
              disabled={isProcessing || !selectedPkg}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-purple-950 font-bold text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Zap className="w-4 h-4 animate-spin" />
                  กำลังดำเนินการ…
                </>
              ) : omiseEnabled ? (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  ชำระ ฿{selectedPkg?.priceThb ?? '—'} (+{totalCredits} CR)
                </>
              ) : (
                <>
                  <FlaskConical className="w-4 h-4" />
                  จำลองเติม +{totalCredits} Credits
                </>
              )}
            </button>
          </>
        )
      )}
    </ModalShell>
  );
};
