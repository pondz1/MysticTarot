import React, { useState, useEffect } from 'react';
import type { ApiSettings, AiConnectionMode } from '../../features/tarot/types/tarot';
import { PROVIDER_PRESETS } from '../../services/aiService';
import { Settings, X, Key, Globe, Cpu, Check, Sparkles, Coins, RefreshCw } from 'lucide-react';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ApiSettings;
  onSaveSettings: (newSettings: ApiSettings) => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings
}) => {
  const [mode, setMode] = useState<AiConnectionMode>(settings.mode || 'credit');
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [baseUrl, setBaseUrl] = useState(settings.baseUrl || 'https://api.openai.com/v1');
  const [model, setModel] = useState(settings.model || 'gpt-4o-mini');
  const [credits, setCredits] = useState<number | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(false);
  const [refillSuccess, setRefillSuccess] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(settings.mode || 'credit');
      setApiKey(settings.apiKey || '');
      setBaseUrl(settings.baseUrl || 'https://api.openai.com/v1');
      setModel(settings.model || 'gpt-4o-mini');
      fetchCredits();
    }
  }, [isOpen, settings]);

  const fetchCredits = async () => {
    setLoadingCredits(true);
    try {
      const { getSessionId } = await import('../../services/ai/aiClient');
      const res = await fetch('/api/user/credits', {
        headers: { 'X-Session-ID': getSessionId() },
      });
      if (res.ok) {
        const data = await res.json();
        setCredits(data.credits);
      }
    } catch (e) {
      console.warn('Failed to fetch user credits:', e);
    } finally {
      setLoadingCredits(false);
    }
  };

  const handleRefillCredits = async () => {
    try {
      const { getSessionId } = await import('../../services/ai/aiClient');
      const res = await fetch('/api/user/refill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': getSessionId(),
        },
        body: JSON.stringify({ amount: 10 }),
      });
      if (res.ok) {
        const data = await res.json();
        setCredits(data.credits);
        setRefillSuccess(true);
        window.dispatchEvent(new CustomEvent('user_credits_updated', { detail: data.credits }));
        setTimeout(() => setRefillSuccess(false), 2000);
      }
    } catch (e) {
      console.warn('Failed to refill credits:', e);
    }
  };


  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof PROVIDER_PRESETS[0]) => {
    setBaseUrl(preset.baseUrl);
    setModel(preset.model);
    if (preset.apiKey) {
      setApiKey(preset.apiKey);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      mode,
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim() || 'https://api.openai.com/v1',
      model: model.trim() || 'gpt-4o-mini'
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel-gold rounded-2xl p-6 border border-amber-400/50 shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-300 animate-spin-slow" />
            <h3 className="text-base font-bold font-serif-mystic text-gold-gradient">
              ตั้งค่าการเชื่อมต่อ AI & ระบบ Credit
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-purple-300 hover:text-white hover:bg-purple-900/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <button
            type="button"
            onClick={() => setMode('credit')}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all text-xs font-semibold cursor-pointer ${
              mode === 'credit'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10'
                : 'bg-purple-950/40 border-purple-500/20 text-purple-300 hover:bg-purple-900/40'
            }`}
          >
            <Coins className="w-4 h-4 text-amber-400" />
            <span>ระบบ Credit ( Server )</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('custom')}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all text-xs font-semibold cursor-pointer ${
              mode === 'custom'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10'
                : 'bg-purple-950/40 border-purple-500/20 text-purple-300 hover:bg-purple-900/40'
            }`}
          >
            <Key className="w-4 h-4 text-amber-400" />
            <span>Custom API Key ( ตัวเอง )</span>
          </button>
        </div>

        {/* Mode 1: Credit Mode UI */}
        {mode === 'credit' && (
          <div className="flex flex-col gap-4 mb-5 p-4 rounded-xl bg-purple-950/60 border border-amber-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400 animate-bounce-slow" />
                <div>
                  <div className="text-xs text-purple-200 font-medium">เครดิตใช้งาน AI คงเหลือ</div>
                  <div className="text-xl font-extrabold text-amber-300 font-serif-mystic">
                    {loadingCredits ? '...' : (credits !== null ? `${credits} เครดิต` : '10 เครดิต')}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRefillCredits}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-900/80 hover:bg-purple-800 border border-amber-400/40 text-amber-200 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{refillSuccess ? '+10 เติมสำเร็จ!' : 'เติม เครดิต (Mockup)'}</span>
              </button>
            </div>

            <p className="text-[11px] text-purple-300 leading-relaxed border-t border-purple-800/40 pt-2.5">
              ✨ ใช้บริการ AI ผ่าน Server ของระบบโดยตรง ไม่ต้องมี API Key ของตัวเอง แต่ละคำถามจะใช้ <strong>1 Credit</strong> (สามารถทดลองกดเติม Credit mockup ได้ตามต้องการ)
            </p>
          </div>
        )}

        {/* Mode 2: Custom API Key Mode UI */}
        {mode === 'custom' && (
          <div className="flex flex-col gap-3.5 mb-4">
            
            {/* Presets */}
            <div>
              <label className="text-xs text-purple-200 font-medium mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                เลือกโมเดล AI ที่ต้องการเชื่อมต่อ:
              </label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {PROVIDER_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 hover:text-amber-200 transition-all cursor-pointer"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* API Key */}
            <div>
              <label className="text-xs font-medium text-slate-200 mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                API Key ตัวเอง
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 rounded-lg bg-black/50 border border-purple-500/40 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Base URL */}
            <div>
              <label className="text-xs font-medium text-slate-200 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                API Base URL (OpenAI-compatible)
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.openai.com/v1"
                className="w-full px-3 py-2 rounded-lg bg-black/50 border border-purple-500/40 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Model Name */}
            <div>
              <label className="text-xs font-medium text-slate-200 mb-1 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                Model Name
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="gpt-4o-mini"
                className="w-full px-3 py-2 rounded-lg bg-black/50 border border-purple-500/40 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        )}

        {/* Action Footer */}
        <form onSubmit={handleSave} className="flex justify-end gap-2 border-t border-amber-500/20 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            ยกเลิก
          </button>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md cursor-pointer"
          >
            {savedSuccess ? <Check className="w-4 h-4" /> : null}
            <span>{savedSuccess ? 'บันทึกเรียบร้อย' : 'บันทึกการตั้งค่า'}</span>
          </button>
        </form>

      </div>
    </div>
  );
};
