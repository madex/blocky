import React, { useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, Check, Lock, Play, Sparkles, Trophy } from 'lucide-react';
import {
  ADVENTURE_LEVELS,
  TOTAL_ADVENTURE_LEVELS,
} from '../data/adventureLevels';
import type { AdventureLevelDef, GemType, Language } from '../types/game';
import { COPY } from '../utils/i18n';
import { GemIcon } from './BlockTile';

interface AdventureMapScreenProps {
  highestUnlocked: number;
  selectedLevel: number;
  consecutiveVictories: number;
  language: Language;
  onSelectLevel: (level: number) => void;
  onStartLevel: (level: number) => void;
  onBack: () => void;
}

/**
 * Stepped Pyramid row widths from bottom (Level 1) to summit (Level 96):
 * 8x8 (64) + 6x3 (18) + 4x2 (8) + 3 (3) + 2 (2) + 1 (1) = 96 levels!
 */
const PYRAMID_ROW_WIDTHS_BOTTOM_UP = [
  8, 8, 8, 8, 8, 8, 8, 8, 6, 6, 6, 4, 4, 3, 2, 1,
];

export const AdventureMapScreen: React.FC<AdventureMapScreenProps> = ({
  highestUnlocked,
  selectedLevel,
  consecutiveVictories,
  language,
  onSelectLevel,
  onStartLevel,
  onBack,
}) => {
  const t = COPY[language];
  const selectedTileRef = useRef<HTMLButtonElement | null>(null);

  const currentDef =
    ADVENTURE_LEVELS.find((l) => l.level === selectedLevel) ??
    ADVENTURE_LEVELS[0];

  const completedCount = Math.max(0, highestUnlocked - 1);

  // Build rows bottom-up, then reverse so Level 96 + Trophy sits at the top and Level 1 at the base!
  const pyramidRowsTopDown = useMemo(() => {
    const rowsBottomUp: AdventureLevelDef[][] = [];
    let cursor = 0;
    for (const width of PYRAMID_ROW_WIDTHS_BOTTOM_UP) {
      rowsBottomUp.push(ADVENTURE_LEVELS.slice(cursor, cursor + width));
      cursor += width;
    }
    return rowsBottomUp.reverse();
  }, []);

  useEffect(() => {
    if (selectedTileRef.current) {
      selectedTileRef.current.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      });
    }
  }, []);

  return (
    <div className="h-[100dvh] flex flex-col bg-[#16224C] bg-gradient-to-b from-[#1D2E68] via-[#16224C] to-[#0E1634] text-slate-100 overflow-hidden">
      {/* Top Bar */}
      <header className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4 border-b border-white/10 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-200 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.home}</span>
        </button>

        <h1 className="font-display font-bold text-base sm:text-lg text-white truncate">
          {t.adventureMapTitle}
        </h1>

        <div className="font-mono-num text-xs sm:text-sm text-amber-300 font-semibold whitespace-nowrap shrink-0">
          {completedCount}/{TOTAL_ADVENTURE_LEVELS}
        </div>
      </header>

      {/* Scrollable 96-Level Stepped Pyramid (Trophy at Summit -> Level 1 at Base) */}
      <main className="flex-1 w-full overflow-y-auto px-2.5 sm:px-4 py-6">
        <div className="max-w-lg mx-auto flex flex-col items-center gap-1.5 sm:gap-2">
          {/* Golden Summit Trophy Crown */}
          <div className="flex flex-col items-center mb-1">
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 flex items-center justify-center shadow-xl transition-all ${
                highestUnlocked >= TOTAL_ADVENTURE_LEVELS
                  ? 'bg-amber-400/25 border-amber-300 shadow-amber-400/30'
                  : 'bg-[#1D2D5E]/90 border-amber-400/50 shadow-black/40'
              }`}
            >
              <Trophy className="w-8 h-8 sm:w-9 sm:h-9 text-amber-300 drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)]" />
            </div>
            <div className="w-10 h-1.5 rounded-b-md bg-amber-500/50" />
          </div>

          {/* Stepped Pyramid Rows */}
          {pyramidRowsTopDown.map((rowLevels, rIdx) => (
            <div
              key={`pyr_row_${rIdx}`}
              className="flex items-center justify-center gap-1 sm:gap-1.5 w-full"
            >
              {rowLevels.map((lvl) => {
                const isCleared = lvl.level < highestUnlocked;
                const isCurrent = lvl.level === highestUnlocked;
                const isUnlocked = lvl.level <= highestUnlocked;
                const isSelected = lvl.level === selectedLevel;

                return (
                  <button
                    key={lvl.level}
                    ref={isSelected ? selectedTileRef : null}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => {
                      onSelectLevel(lvl.level);
                      if (lvl.level === selectedLevel) {
                        onStartLevel(lvl.level);
                      }
                    }}
                    aria-label={`${t.levelLabel} ${lvl.level}`}
                    className={`relative w-[38px] h-[38px] sm:w-[48px] sm:h-[48px] rounded-lg sm:rounded-xl border flex flex-col items-center justify-center transition-all duration-150 shrink-0 ${
                      !isUnlocked
                        ? 'bg-[#131E42]/85 border-white/10 text-slate-400/65 cursor-not-allowed'
                        : isSelected
                          ? 'bg-amber-400 border-yellow-200 text-slate-950 shadow-[0_0_16px_rgba(251,191,36,0.65)] scale-105 z-10 cursor-pointer'
                          : isCurrent
                            ? 'bg-sky-500/30 border-sky-300 text-white hover:border-white cursor-pointer'
                            : 'bg-emerald-500/20 border-emerald-400/55 text-white hover:border-emerald-300 cursor-pointer'
                    }`}
                  >
                    <span className="font-mono-num font-extrabold text-xs sm:text-sm leading-none">
                      {lvl.level}
                    </span>

                    <div className="mt-0.5 h-3 flex items-center justify-center">
                      {!isUnlocked ? (
                        <Lock className="w-2.5 h-2.5 opacity-55" />
                      ) : isCleared ? (
                        <Check
                          className={`w-3 h-3 stroke-[2.75] ${
                            isSelected ? 'text-slate-950' : 'text-emerald-300'
                          }`}
                        />
                      ) : lvl.type === 'collect' && lvl.targets ? (
                        <GemIcon
                          gem={Object.keys(lvl.targets)[0] as GemType}
                          className="w-3 h-3"
                        />
                      ) : (
                        <span
                          className={`font-mono-num text-[9px] font-bold leading-none ${
                            isSelected ? 'text-slate-900' : 'text-amber-300'
                          }`}
                        >
                          ★
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </main>

      {/* Bottom Launch Dock (matching Walkthrough 4's prominent green Level button!) */}
      <footer className="w-full bg-[#0F1734]/95 border-t border-white/15 px-4 py-3 sm:py-4 shrink-0">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-base sm:text-lg text-white whitespace-nowrap">
                {t.levelLabel} {currentDef.level}
              </span>
              {consecutiveVictories > 0 && (
                <span className="font-mono-num text-xs font-semibold text-amber-300 inline-flex items-center gap-1 whitespace-nowrap">
                  <Sparkles className="w-3.5 h-3.5" />
                  {consecutiveVictories}×
                </span>
              )}
            </div>

            {currentDef.type === 'score' ? (
              <p className="text-xs sm:text-sm text-slate-300 truncate">
                {t.targetScoreLabel}:{' '}
                <span className="font-mono-num font-bold text-amber-300">
                  {(currentDef.targetScore ?? 0).toLocaleString()}
                </span>
              </p>
            ) : (
              <div className="flex items-center flex-wrap gap-2 text-xs sm:text-sm text-slate-300 mt-0.5">
                {(
                  Object.entries(currentDef.targets ?? {}) as [
                    GemType,
                    number,
                  ][]
                ).map(([gem, count]) => (
                  <span
                    key={gem}
                    className="inline-flex items-center gap-1 font-mono-num font-bold text-white"
                  >
                    <GemIcon gem={gem} className="w-3.5 h-3.5" />
                    <span>{count}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onStartLevel(currentDef.level)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-extrabold text-base shadow-lg shadow-emerald-500/25 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>
              {t.playLevel} {currentDef.level}
            </span>
          </button>
        </div>
      </footer>
    </div>
  );
};
