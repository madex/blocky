import React, { useRef, useState } from 'react';
import {
  Check,
  Database,
  Download,
  Server,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type { Language } from '../types/game';
import { COPY } from '../utils/i18n';

interface PrivacyModalProps {
  open: boolean;
  language: Language;
  storageEnabled: boolean;
  onToggleStorage: (enabled: boolean) => void;
  onExportData: () => void;
  onImportData: (jsonText: string) => boolean;
  onClearAllData: () => void;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  open,
  language,
  storageEnabled,
  onToggleStorage,
  onExportData,
  onImportData,
  onClearAllData,
  onClose,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'ok' | 'err';
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!open) return null;
  const t = COPY[language];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      const ok = onImportData(text);
      setStatusMessage({
        type: ok ? 'ok' : 'err',
        text: ok ? t.privacyImportedDone : t.privacyImportError,
      });
      setConfirmClear(false);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-[#131A2B] border border-slate-700/80 p-5 sm:p-6 shadow-2xl max-h-[90dvh] overflow-y-auto text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2
                id="privacy-modal-title"
                className="font-display font-bold text-lg sm:text-xl text-white"
              >
                {t.privacyTitle}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.privacySubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed">
          {/* 1. Zero Tracking */}
          <section className="rounded-xl bg-[#0E1422] border border-slate-800 p-3.5">
            <h3 className="font-display font-bold text-sm text-emerald-300 mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{t.privacyNoTrackingTitle}</span>
            </h3>
            <p className="text-slate-300">{t.privacyNoTrackingText}</p>
          </section>

          {/* 2. LocalStorage + Consent Toggle */}
          <section className="rounded-xl bg-[#0E1422] border border-slate-800 p-3.5 space-y-3">
            <div>
              <h3 className="font-display font-bold text-sm text-sky-300 mb-1 flex items-center gap-2">
                <Database className="w-4 h-4 shrink-0" />
                <span>{t.privacyLocalTitle}</span>
              </h3>
              <p className="text-slate-300">{t.privacyLocalText}</p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
              <span className="font-medium text-white text-xs sm:text-sm">
                {t.privacyStorageToggle}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={storageEnabled}
                onClick={() => onToggleStorage(!storageEnabled)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  storageEnabled
                    ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    storageEnabled ? 'bg-emerald-400' : 'bg-slate-500'
                  }`}
                />
                <span>
                  {storageEnabled ? t.privacyStorageOn : t.privacyStorageOff}
                </span>
              </button>
            </div>
          </section>

          {/* 3. GitHub Pages Hosting Notice */}
          <section className="rounded-xl bg-[#0E1422] border border-slate-800 p-3.5">
            <h3 className="font-display font-bold text-sm text-amber-300 mb-1 flex items-center gap-2">
              <Server className="w-4 h-4 shrink-0" />
              <span>{t.privacyHostingTitle}</span>
            </h3>
            <p className="text-slate-300">{t.privacyHostingText}</p>
          </section>

          {/* 4. Data Export / Import / Delete (Waudoku-style self-service) */}
          <section className="rounded-xl bg-[#0E1422] border border-slate-800 p-3.5 space-y-3">
            <h3 className="font-display font-bold text-sm text-white">
              {t.privacyManageTitle}
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onExportData();
                  setConfirmClear(false);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                <span>{t.privacyExportBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.privacyImportBtn}</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleFileChange}
                className="hidden"
              />

              {!confirmClear ? (
                <button
                  type="button"
                  onClick={() => {
                    setConfirmClear(true);
                    setStatusMessage(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-xs font-semibold text-rose-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.privacyClearBtn}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClearAllData();
                    setConfirmClear(false);
                    setStatusMessage({
                      type: 'ok',
                      text: t.privacyClearedDone,
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-xs font-bold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.privacyConfirmClearBtn}</span>
                </button>
              )}
            </div>

            {statusMessage && (
              <div
                className={`flex items-center gap-1.5 text-xs font-medium pt-1 ${
                  statusMessage.type === 'ok'
                    ? 'text-emerald-300'
                    : 'text-rose-300'
                }`}
              >
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{statusMessage.text}</span>
              </div>
            )}
          </section>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-display font-bold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
