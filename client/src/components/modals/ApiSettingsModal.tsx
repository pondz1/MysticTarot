import React, { useState, useEffect } from 'react';
import type { ApiSettings, AiConnectionMode } from '../../types';
import { PROVIDER_PRESETS } from '../../services/aiService';
import { Settings, X, Key, Globe, Cpu, Check, Sparkles, Coins, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ApiSettings;
  onSaveSettings: (newSettings: ApiSettings) => void;
  onOpenCreditCenter?: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onOpenCreditCenter,
}) => {
  const { credits } = useAuth();
  const [mode, setMode] = useState<AiConnectionMode>(settings.mode || 'credit');
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [baseUrl, setBaseUrl] = useState(settings.baseUrl || '');
  const [model, setModel] = useState(settings.model || '');
  const [enableStreaming, setEnableStreaming] = useState<boolean>(settings.enableStreaming !== false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(settings.apiKey || '');
      setBaseUrl(settings.baseUrl || '');
      setModel(settings.model || '');
      setMode(settings.mode || 'credit');
      setEnableStreaming(settings.enableStreaming !== false);
    }
  }, [isOpen, settings]);

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
      model: model.trim() || 'gpt-4o-mini',
      enableStreaming,
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
              ตั้งค่าการเชื่อมต่อ AI (AI Settings)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-purple-300 hover:text-white hover:bg-purple-900/60 transition-colors cursor-pointer"
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
            <span>ระบบ เครดิต (Server AI)</span>
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

        {/* Mode 1: Server Credit Info */}
        {mode === 'credit' && (
          <div className="flex flex-col gap-4 mb-5 p-4 rounded-xl bg-purple-950/60 border border-amber-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400 animate-bounce-slow" />
                <div>
                  <div className="text-xs text-purple-200 font-medium">ยอด Credit คงเหลือของคุณ</div>
                  <div className="text-xl font-extrabold text-amber-300 font-serif-mystic">
                    {credits !== null ? `${credits} CR` : '10 CR'}
                  </div>
                </div>
              </div>

              {onOpenCreditCenter && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCreditCenter();
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-purple-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  จัดการ & เติม เครดิต
                </button>
              )}
            </div>

            <p className="text-[11px] text-purple-300 leading-relaxed border-t border-purple-800/40 pt-2.5">
              ✨ ใช้บริการ AI ประมวลผลผ่าน Server หลักของระบบโดยตรง ไม่จำเป็นต้องกรอก API Key ตัวเอง (คิดค่าบริการตาม Token ที่ประมวลผลจริง)
            </p>
          </div>
        )}

        {/* Mode 2: Custom API Key Form */}
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

        {/* Streaming Response Toggle */}
        <div className="my-4 pt-3 border-t border-amber-500/20">
          <div className="flex items-center justify-between p-3 rounded-xl bg-purple-950/60 border border-purple-500/30">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-slate-100">
                   Streaming Response Mode
                </div>
                <div className="text-[11px] text-purple-200/70 mt-0.5">
                  {enableStreaming
                    ? 'เปิดอยู่: แสดงตัวอักษรเรียลไทม์ขณะ AI กำลังคิดคำทำนาย'
                    : 'ปิดอยู่: รอ AI คิดประมวลผลจนจบแล้วแสดงผลครั้งเดียว'}
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-2">
              <input
                type="checkbox"
                checked={enableStreaming}
                onChange={(e) => setEnableStreaming(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>

        {/* Action Footer */}
        <form onSubmit={handleSave} className="flex justify-end gap-2 border-t border-amber-500/20 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
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
