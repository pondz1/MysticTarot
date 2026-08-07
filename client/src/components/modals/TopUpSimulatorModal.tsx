import React, { useState, useEffect } from 'react';
import { Coins, X, Check, QrCode, CreditCard, Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import { ModalShell } from '../common/ModalShell';

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
  { id: 'pkg_starter', name: 'Starter Pack', baseCredits: 20, bonusCredits: 0, priceThb: 29 },
  { id: 'pkg_popular', name: 'Popular Pack', baseCredits: 50, bonusCredits: 5, priceThb: 59, badge: '🔥 ขายดีที่สุด', popular: true },
  { id: 'pkg_pro', name: 'Pro Pack', baseCredits: 100, bonusCredits: 20, priceThb: 99, badge: '✨ คุ้มค่า' },
  { id: 'pkg_ultimate', name: 'Ultimate Pack', baseCredits: 250, bonusCredits: 60, priceThb: 199, badge: '🚀 โบนัส +24%' },
];

interface TopUpSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newCredits: number) => void;
}

export const TopUpSimulatorModal: React.FC<TopUpSimulatorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { refreshCredits } = useAuth();
  const [packages, setPackages] = useState<TopUpPackage[]>(TOPUP_PACKAGES);
  const [selectedPkg, setSelectedPkg] = useState<TopUpPackage>(TOPUP_PACKAGES[1]);
  const [paymentMethod, setPaymentMethod] = useState<'promptpay' | 'card'>('promptpay');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successInfo, setSuccessInfo] = useState<{ added: number; total: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      apiClient
        .get<{ packages: TopUpPackage[] }>('/api/user/packages')
        .then((res) => {
          if (Array.isArray(res.packages) && res.packages.length > 0) {
            setPackages(res.packages);
            setSelectedPkg(res.packages.find((p) => p.popular) || res.packages[0]);
          }
        })
        .catch((err) => console.warn('Failed to fetch packages from server, using fallback:', err));
    }
  }, [isOpen]);

  const totalCredits = (selectedPkg?.baseCredits || 20) + (selectedPkg?.bonusCredits || 0);

  const handleSimulatePayment = async () => {
    if (!selectedPkg) return;
    setIsProcessing(true);
    try {
      const res = await apiClient.post<{ credits: number; added: number }>('/api/user/topup-simulate', {
        packageId: selectedPkg.id,
        amount: totalCredits,
        packageName: selectedPkg.name,
      });

      if (typeof res.credits === 'number') {
        const updatedCredits = res.credits;
        const actualAdded = typeof res.added === 'number' ? res.added : totalCredits;
        setSuccessInfo({ added: actualAdded, total: updatedCredits });
        window.dispatchEvent(new CustomEvent('user_credits_updated', { detail: updatedCredits }));
        refreshCredits();
        if (onSuccess) onSuccess(updatedCredits);
      }
    } catch (err) {
      console.error('Failed to process topup payment:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setSuccessInfo(null);
    onClose();
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      titleId="topup-modal-title"
      maxWidthClass="max-w-lg"
      zClass="z-[60]"
      panelClassName="glass-panel-gold rounded-2xl p-6 border border-amber-400/50 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto overscroll-contain"
    >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-3 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 shrink-0">
              <Coins className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 id="topup-modal-title" className="text-base font-bold text-amber-100">
                แพ็กเกจเติมเครดิต AI
              </h3>
              <p className="text-[11px] text-slate-400">เลือกแพ็กเกจและช่องทางชำระเงิน</p>
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

        {/* Success View */}
        {successInfo ? (
          <div className="flex flex-col items-center justify-center py-6 text-center animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-pulse" />
            </div>
            <h4 className="text-xl font-bold text-emerald-300 font-serif-mystic mb-1">
              ชำระเงินสำเร็จเรียบร้อย!
            </h4>
            <p className="text-xs text-purple-200 mb-4">
              เพิ่มเข้าสู่บัญชีของคุณแล้ว <span className="text-amber-300 font-bold">+{successInfo.added} Credits</span>
            </p>

            <div className="w-full bg-purple-950/80 border border-amber-400/40 rounded-xl p-4 mb-6">
              <div className="text-xs text-purple-300 mb-1">ยอด Credit คงเหลือทั้งหมด</div>
              <div className="text-3xl font-extrabold text-amber-300 font-serif-mystic">
                {successInfo.total} CR
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-purple-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              ตกลง และ เริ่มทำนายดวงชะตา
            </button>
          </div>
        ) : (
          <>
            {/* Package Selector */}
            <div className="mb-5">
              <label className="text-xs text-purple-200 font-semibold mb-2 block flex items-center justify-between">
                <span>1. เลือกแพ็กเกจ Credit ที่ต้องการ:</span>
                <span className="text-[10px] text-amber-300/80">1 Credit ≈ 1k-4k Tokens</span>
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                {packages.map((pkg) => {
                  const isSelected = selectedPkg?.id === pkg.id;
                  const total = pkg.baseCredits + pkg.bonusCredits;
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPkg(pkg)}
                      className={`relative flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/20'
                          : 'bg-purple-950/40 border-purple-500/20 hover:bg-purple-900/40'
                      }`}
                    >
                      {pkg.badge && (
                        <span className="absolute -top-2 right-2 text-[9px] px-2 py-0.5 rounded-full bg-amber-500 text-purple-950 font-bold shadow-sm">
                          {pkg.badge}
                        </span>
                      )}
                      
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-purple-100">{pkg.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                      </div>

                      <div className="text-lg font-extrabold text-amber-300 font-serif-mystic">
                        {total} <span className="text-xs font-normal text-purple-300">Credits</span>
                      </div>

                      {pkg.bonusCredits > 0 && (
                        <div className="text-[10px] text-emerald-400 flex items-center gap-0.5 font-medium">
                          <Sparkles className="w-3 h-3" />
                          <span>(ฟรีโบนัส +{pkg.bonusCredits} CR)</span>
                        </div>
                      )}

                      <div className="mt-2 text-xs font-semibold text-purple-200 border-t border-purple-800/40 pt-1.5 flex justify-between">
                        <span>ราคา:</span>
                        <span className="text-amber-300">฿{pkg.priceThb}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="mb-5">
              <label className="text-xs text-purple-200 font-semibold mb-2 block">
                2. เลือกช่องทางชำระเงิน:
              </label>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('promptpay')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    paymentMethod === 'promptpay'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-purple-950/40 border-purple-500/20 text-purple-300 hover:bg-purple-900/40'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>PromptPay QR Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-purple-950/40 border-purple-500/20 text-purple-300 hover:bg-purple-900/40'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>บัตรเครดิต / เดบิต</span>
                </button>
              </div>

              {/* QR Code / Card UI */}
              {paymentMethod === 'promptpay' ? (
                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-purple-950/80 border border-amber-500/30 text-center">
                  <div className="p-3 bg-white rounded-xl shadow-lg mb-2">
                    <QrCode className="w-24 h-24 text-slate-900" />
                  </div>
                  <div className="text-xs font-bold text-amber-300">สแกนชำระเงิน ฿{selectedPkg.priceThb}</div>
                  <div className="text-[10px] text-purple-300">รองรับ Mobile Banking ทุกธนาคาร</div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-purple-950/80 border border-amber-500/30 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-purple-200 mb-1">
                    <span>บัตรชำระเงิน:</span>
                    <span className="text-amber-300 font-mono">•••• •••• •••• 4242</span>
                  </div>
                  <div className="text-[11px] text-purple-300">
                    ยอดชำระ: <strong className="text-amber-300">฿{selectedPkg.priceThb}</strong> (ทำรายการอัตโนมัติ)
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-purple-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Zap className="w-4 h-4 animate-spin" />
                    <span>กำลังประมวลผลการชำระเงิน...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>ยืนยันการชำระเงิน (+{totalCredits} Credits)</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-purple-400 mt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>ปลอดภัย 100% เครดิตเข้าสู่บัญชีทันทีหลังชำระเงิน</span>
              </div>
            </div>
          </>
        )}
    </ModalShell>
  );
};
