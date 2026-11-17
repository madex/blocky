import React from 'react';
import { ArrowLeft, ArrowRight, Map, Sparkles, Trophy } from 'lucide-react';
import { TOTAL_ADVENTURE_LEVELS } from '../data/adventureLevels';
import type { GameMode, Language } from '../types/game';
import { COPY } from '../utils/i18n';

interface LevelCompleteModalProps {
  open: boolean;
  mode: GameMode;
  level: number;
  stageTitle?: string;
  score: number;
  consecutiveVictories: number;
  language: Language;
  onNextLevel: () => void;
  onSecondaryAction: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  open,
  mode,
  level,
  stageTitle,
  score,
  consecutiveVictories,
  language,
  onNextLevel,
  onSecondaryAction,
}) => {
  if (!open) return null;
  const t = COPY[language];
  const isBoardClear = mode === 'boardclear';
  const hasNext = isBoardClear || level < TOTAL_ADVENTURE_LEVELS;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="level-complete-title"
    >
      <div
        className={`w-full max-w-sm rounded-2xl bg-[#131A2B] border p-6 shadow-2xl text-center ${
          isBoardClear ? 'border-purple-400/50' : 'border-amber-400/40'
        }`}
      >
        <div
          className={`mx-auto w-14 h-14 rounded-2xl border flex items-center justify-center mb-4 ${
            isBoardClear
              ? 'bg-purple-500/15 border-purple-400/45'
              : 'bg-amber-400/15 border-amber-400/40'
          }`}
        >
          <Trophy
            className={`w-7 h-7 ${
              isBoardClear ? 'text-purple-300' : 'text-amber-300'
            }`}
          />
        </div>

        <div
          className={`text-xs font-medium mb-1 ${
            isBoardClear ? 'text-purple-300' : 'text-amber-300/90'
          }`}
        >
          {isBoardClear
            ? `${t.stageLabel} ${level}${stageTitle ? ` · ${stageTitle}` : ''}`
            : `${t.levelLabel} ${level}`}
        </div>
        <h2
          id="level-complete-title"
          className="font-display font-extrabold text-2xl sm:text-3xl text-white mb-2"
        >
          {isBoardClear
            ? t.boardClearedTitle
            : hasNext
              ? t.wellDone
              : t.allLevelsCleared}
        </h2>

        {consecutiveVictories > 1 && (
          <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-300 mb-4">
            <Sparkles className="w-4 h-4" />
            <span>
              {t.consecutiveVictories}: {consecutiveVictories}×
            </span>
          </div>
        )}

        <div className="py-4 border-y border-slate-800 my-4">
          <div className="text-xs text-slate-400 mb-1">{t.score}</div>
          <div className="font-mono-num font-bold text-3xl text-white">
            {score.toLocaleString()}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {hasNext && (
            <button
              type="button"
              onClick={onNextLevel}
              className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-display font-bold text-base transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isBoardClear
                  ? 'bg-purple-500 hover:bg-purple-400 text-white'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
              }`}
            >
              <span>{isBoardClear ? t.nextStage : t.nextLevel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onSecondaryAction}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-transparent hover:bg-slate-800/80 text-slate-300 font-medium text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isBoardClear ? (
              <ArrowLeft className="w-4 h-4" />
            ) : (
              <Map className="w-4 h-4" />
            )}
            <span>{isBoardClear ? t.home : t.backToMap}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
