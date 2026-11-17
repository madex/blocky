import React, { useEffect, useState } from 'react';
import { ArrowLeft, Crown, Map, Play, RotateCcw } from 'lucide-react';
import type { GameMode, Language } from '../types/game';
import { COPY } from '../utils/i18n';
import { soundEngine } from '../utils/sound';

interface GameOverModalProps {
  open: boolean;
  mode: GameMode;
  adventureLevel?: number;
  boardClearStage?: number;
  score: number;
  highScore: number;
  isNewRecord: boolean;
  linesCleared: number;
  bestStreak: number;
  language: Language;
  onPlayAgain: () => void;
  onChangeMode: () => void;
  onOpenAdventureMap?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  open,
  mode,
  adventureLevel = 1,
  boardClearStage = 1,
  score,
  highScore,
  isNewRecord,
  linesCleared,
  bestStreak,
  language,
  onPlayAgain,
  onChangeMode,
  onOpenAdventureMap,
}) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!open) {
      setDisplayScore(0);
      return;
    }
    if (score <= 0) {
      setDisplayScore(0);
      return;
    }

    let rafId = 0;
    const duration = 720;
    const start = performance.now();
    let lastTickStep = -1;

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(score * eased);
      setDisplayScore(current);

      const tickBucket = Math.floor(progress * 10);
      if (tickBucket > lastTickStep && progress < 1) {
        lastTickStep = tickBucket;
        soundEngine.playScoreTick(progress);
      }

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [open, score]);

  if (!open) return null;
  const t = COPY[language];

  const isAdventure = mode === 'adventure';
  const isBoardClear = mode === 'boardclear';
  const modeLabel = isAdventure
    ? `${t.levelLabel} ${adventureLevel}`
    : isBoardClear
      ? `${t.stageLabel} ${boardClearStage}`
      : mode === 'blocksturz'
        ? t.modeBlocksturz
        : t.modeBlockBlast;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gameover-title"
    >
      <div className="w-full max-w-sm rounded-2xl bg-gradient-to-b from-[#1E2646] to-[#131A2B] border border-slate-700/80 p-6 shadow-2xl text-center">
        <div className="text-xs font-medium text-slate-400 mb-1">
          {modeLabel}
        </div>

        {!isAdventure && !isBoardClear && isNewRecord ? (
          <div className="flex flex-col items-center mb-3">
            <Crown className="w-9 h-9 text-amber-400 fill-amber-400 mb-1 drop-shadow-[0_2px_10px_rgba(251,191,36,0.5)]" />
            <h2
              id="gameover-title"
              className="font-display font-extrabold text-2xl sm:text-3xl text-amber-300"
            >
              {t.newRecord}
            </h2>
          </div>
        ) : (
          <h2
            id="gameover-title"
            className="font-display font-bold text-2xl text-white mb-4"
          >
            {isAdventure || isBoardClear ? t.soCloseTitle : t.gameOverTitle}
          </h2>
        )}

        <div className="py-4 border-y border-slate-700/60 mb-5">
          <div className="text-xs text-slate-400 mb-1">{t.finalScore}</div>
          <div className="font-mono-num font-extrabold text-4xl sm:text-5xl text-white">
            {displayScore.toLocaleString()}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center mb-6">
          <div>
            <div className="text-xs text-slate-400">
              {isAdventure
                ? t.levelLabel
                : isBoardClear
                  ? t.stageLabel
                  : t.bestScore}
            </div>
            <div className="font-mono-num font-semibold text-base text-slate-100 mt-0.5">
              {isAdventure
                ? adventureLevel
                : isBoardClear
                  ? boardClearStage
                  : highScore.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">{t.linesClearedLabel}</div>
            <div className="font-mono-num font-semibold text-base text-slate-100 mt-0.5">
              {linesCleared}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">{t.bestStreakLabel}</div>
            <div className="font-mono-num font-semibold text-base text-slate-100 mt-0.5">
              {bestStreak}×
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onPlayAgain}
            className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-display font-bold text-base transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isAdventure || (!isBoardClear && isNewRecord)
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                : isBoardClear
                  ? 'bg-purple-500 hover:bg-purple-400 text-white'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
            }`}
          >
            {isAdventure || isBoardClear ? (
              <RotateCcw className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            <span>
              {isAdventure || isBoardClear ? t.retry : t.playAgain}
            </span>
          </button>

          {isAdventure && onOpenAdventureMap ? (
            <button
              type="button"
              onClick={onOpenAdventureMap}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-transparent hover:bg-slate-800/80 text-slate-300 font-medium text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Map className="w-4 h-4" />
              <span>{t.backToMap}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onChangeMode}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-transparent hover:bg-slate-800/80 text-slate-300 font-medium text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.changeMode}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
