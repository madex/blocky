import React from 'react';
import { X } from 'lucide-react';
import type { Language } from '../types/game';
import { COPY } from '../utils/i18n';

interface RulesModalProps {
  open: boolean;
  language: Language;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({
  open,
  language,
  onClose,
}) => {
  if (!open) return null;
  const t = COPY[language];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rules-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[#131A2B] border border-slate-700/70 p-6 shadow-2xl max-h-[90dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 mb-5">
          <h2
            id="rules-modal-title"
            className="font-display font-bold text-xl text-white"
          >
            {t.rulesTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 text-sm text-slate-300 leading-relaxed">
          <p>{t.rulesBoardClear}</p>
          <p>{t.rulesAdventure}</p>
          <p>{t.rulesGoal}</p>
          <p>{t.rulesControls}</p>
          <p>{t.rulesFalling}</p>
          <p>{t.rulesScoring}</p>
          <p className="pt-3 border-t border-slate-800 text-xs text-slate-400">
            {t.rulesGithub}
          </p>
        </div>

        <div className="mt-6 flex justify-end">
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
