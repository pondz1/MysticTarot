import React, { useState } from 'react';
import type { ApiSettings } from '../types/tarot';
import { PROVIDER_PRESETS } from '../services/aiService';
import { Settings, X, Key, Globe, Cpu, Check, HelpCircle, Sparkles } from 'lucide-react';

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
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [baseUrl, setBaseUrl] = useState(settings.baseUrl);
  const [model, setModel] = useState(settings.model);
  const [savedSuccess, setSavedSuccess] = useState(false);

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
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim() || 'https://api.openai.com/v1',
      model: model.trim() || 'gpt-4o-mini'
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel-gold rounded-2xl p-6 border border-amber-400/50 shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-300 animate-spin-slow" />
            <h3 className="text-base font-bold font-serif-mystic text-gold-gradient">
              ตั้งค่า AI Connection (OpenAI Compatible)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-purple-300 hover:text-white hover:bg-purple-900/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Quick Select Buttons */}
        <div className="mb-4">
          <label className="text-xs text-purple-200 font-medium mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            เลือกผู้ให้บริการสำเร็จรูป (Quick Presets):
          </label>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {PROVIDER_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="text-[11px] px-2.5 py-1 rounded-md bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 hover:text-amber-200 transition-all"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          
          {/* API Key */}
          <div>
            <label className="text-xs font-medium text-slate-200 mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              API Key (เว้นว่างไว้เพื่อใช้ Smart AI Reader ออฟไลน์)
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
              Model Name (ชื่อโมเดล)
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gpt-4o-mini"
              className="w-full px-3 py-2 rounded-lg bg-black/50 border border-purple-500/40 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Information box */}
          <div className="p-3 rounded-lg bg-purple-950/60 border border-amber-500/20 text-[11px] text-purple-200 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              รองรับ OpenAI API, DeepSeek, Groq, OpenRouter หรือ Ollama ท้องถิ่น หากไม่ได้ระบุ API Key ระบบจะใช้ **Smart Built-in Reader** ช่วยทำนายให้ทันทีโดยไม่เสียค่าบริการ
            </p>
          </div>

          {/* Action Footer */}
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : null}
              <span>{savedSuccess ? 'บันทึกเรียบร้อย' : 'บันทึกการตั้งค่า'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
