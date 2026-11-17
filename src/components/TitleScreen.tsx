import React from 'react';
import {
  ArrowDownToLine,
  Compass,
  HelpCircle,
  LayoutGrid,
  Map,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { TOTAL_ADVENTURE_LEVELS } from '../data/adventureLevels';
import { TOTAL_BOARD_CLEAR_STAGES } from '../data/boardClearPuzzles';
import type { GameMode, Language, SavedClassicRun } from '../types/game';
import { COPY } from '../utils/i18n';

interface TitleScreenProps {
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  highScores: { blockblast: number; blocksturz: number; boardclear: number };
  adventureProgress: number;
  boardClearStage: number;
  savedRun: SavedClassicRun | null;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  onStartNewGame: (mode: GameMode) => void;
  onOpenAdventureMap: () => void;
  onResumeGame: () => void;
  onOpenRules: () => void;
  onOpenPrivacy: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  selectedMode,
  onSelectMode,
  highScores,
  adventureProgress,
  boardClearStage,
  savedRun,
  language,
  onToggleLanguage,
  onStartNewGame,
  onOpenAdventureMap,
  onResumeGame,
  onOpenRules,
  onOpenPrivacy,
}) => {
  const t = COPY[language];

  return (
    <div className="min-h-[100dvh] flex flex-col justify-between bg-[#0C111D] text-slate-100">
      {/* Top Bar */}
      <header className="w-full max-w-4xl mx-auto px-4 sm:px-5 py-3.5 flex items-center justify-between gap-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5 shrink-0">
          <img
            src="./blocky-icon.webp"
            alt="Blocky Icon"
            className="w-8 h-8 rounded-lg object-cover border border-white/15 shadow-sm"
          />
          <span className="font-display font-bold text-xl tracking-tight text-white whitespace-nowrap">
            {t.appTitle}
          </span>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          <div
            className="flex items-center bg-[#131A2B] border border-slate-800 rounded-lg p-0.5"
            role="group"
            aria-label="Language"
          >
            <button
              type="button"
              onClick={() => onToggleLanguage('de')}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                language === 'de'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              DE
            </button>
            <button
              type="button"
              onClick={() => onToggleLanguage('en')}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                language === 'en'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenRules}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{t.rules}</span>
          </button>

          <button
            type="button"
            onClick={onOpenPrivacy}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">{t.privacy}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-3xl mx-auto px-5 py-6 sm:py-8 flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-4 mb-6">
          <img
            src="./blocky-icon.webp"
            alt="Blocky App Icon"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-white/15 shadow-xl shadow-indigo-950/60 shrink-0"
          />
          <div>
            <h1
              className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight text-white mb-1.5"
              style={{ textWrap: 'balance' }}
            >
              {t.appTitle}
            </h1>
            <p className="text-slate-400 text-xs sm:text-base leading-relaxed max-w-xl">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* 2x2 Mode Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
          {/* Mode 1: Board Clear (Spielfeld leer bekommen!) */}
          <button
            type="button"
            onClick={() => onSelectMode('boardclear')}
            className={`text-left p-4 sm:p-5 rounded-xl border transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
              selectedMode === 'boardclear'
                ? 'bg-[#1B1D36] border-purple-400/85 shadow-lg shadow-purple-950/35'
                : 'bg-[#131A2B] border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <Sparkles
                className={`w-6 h-6 ${
                  selectedMode === 'boardclear'
                    ? 'text-purple-400'
                    : 'text-slate-400'
                }`}
              />
              <span className="font-mono-num text-xs text-slate-400">
                {t.stageLabel} {boardClearStage}/{TOTAL_BOARD_CLEAR_STAGES}
              </span>
            </div>
            <h2 className="font-display font-bold text-base sm:text-lg text-white mb-1">
              {t.modeBoardClear}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {t.modeBoardClearDesc}
            </p>
          </button>

          {/* Mode 2: Adventure Levels 1-96 */}
          <button
            type="button"
            onClick={() => onSelectMode('adventure')}
            className={`text-left p-4 sm:p-5 rounded-xl border transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              selectedMode === 'adventure'
                ? 'bg-[#1A2236] border-amber-400/85 shadow-lg shadow-amber-950/30'
                : 'bg-[#131A2B] border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <Compass
                className={`w-6 h-6 ${
                  selectedMode === 'adventure'
                    ? 'text-amber-400'
                    : 'text-slate-400'
                }`}
              />
              <span className="font-mono-num text-xs text-slate-400">
                {t.levelLabel} {adventureProgress}/{TOTAL_ADVENTURE_LEVELS}
              </span>
            </div>
            <h2 className="font-display font-bold text-base sm:text-lg text-white mb-1">
              {t.modeAdventure}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {t.modeAdventureDesc}
            </p>
          </button>

          {/* Mode 3: Classic 8x8 */}
          <button
            type="button"
            onClick={() => onSelectMode('blockblast')}
            className={`text-left p-4 sm:p-5 rounded-xl border transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
              selectedMode === 'blockblast'
                ? 'bg-[#172136] border-sky-400/80 shadow-lg shadow-sky-950/40'
                : 'bg-[#131A2B] border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <LayoutGrid
                className={`w-6 h-6 ${
                  selectedMode === 'blockblast'
                    ? 'text-sky-400'
                    : 'text-slate-400'
                }`}
              />
              <span className="font-mono-num text-xs text-slate-400">
                {t.best}: {highScores.blockblast.toLocaleString()}
              </span>
            </div>
            <h2 className="font-display font-bold text-base sm:text-lg text-white mb-1">
              {t.modeBlockBlast}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {t.modeBlockBlastDesc}
            </p>
          </button>

          {/* Mode 4: Blocksturz Tempo */}
          <button
            type="button"
            onClick={() => onSelectMode('blocksturz')}
            className={`text-left p-4 sm:p-5 rounded-xl border transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
              selectedMode === 'blocksturz'
                ? 'bg-[#172136] border-emerald-400/80 shadow-lg shadow-emerald-950/30'
                : 'bg-[#131A2B] border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <ArrowDownToLine
                className={`w-6 h-6 ${
                  selectedMode === 'blocksturz'
                    ? 'text-emerald-400'
                    : 'text-slate-400'
                }`}
              />
              <span className="font-mono-num text-xs text-slate-400">
                {t.best}: {highScores.blocksturz.toLocaleString()}
              </span>
            </div>
            <h2 className="font-display font-bold text-base sm:text-lg text-white mb-1">
              {t.modeBlocksturz}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {t.modeBlocksturzDesc}
            </p>
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {selectedMode === 'adventure' ? (
            <>
              <button
                type="button"
                onClick={() => onStartNewGame('adventure')}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-bold text-base transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {t.levelLabel} {adventureProgress} {t.startGame}
                </span>
              </button>
              <button
                type="button"
                onClick={onOpenAdventureMap}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#131A2B] hover:bg-[#1B253B] border border-slate-700 text-slate-200 font-display font-semibold text-base transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Map className="w-4 h-4" />
                <span>{t.adventureMapTitle}</span>
              </button>
            </>
          ) : selectedMode === 'boardclear' ? (
            <button
              type="button"
              onClick={() => onStartNewGame('boardclear')}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-display font-bold text-base transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {t.stageLabel} {boardClearStage} {t.startGame}
              </span>
            </button>
          ) : savedRun && selectedMode === 'blockblast' ? (
            <>
              <button
                type="button"
                onClick={onResumeGame}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-display font-bold text-base transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {t.continueGame} ({savedRun.score.toLocaleString()})
                </span>
              </button>
              <button
                type="button"
                onClick={() => onStartNewGame('blockblast')}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#131A2B] hover:bg-[#1B253B] border border-slate-700 text-slate-200 font-display font-semibold text-base transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t.newGame}</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onStartNewGame(selectedMode)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-display font-bold text-base transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t.startGame}</span>
            </button>
          )}
        </div>
      </main>

      {/* Quiet Footer with Waudoku-style Datenschutz link */}
      <footer className="w-full max-w-4xl mx-auto px-5 py-4 border-t border-slate-800/60 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3">
        <span>Blocky · Feld räumen · Pyramide 1–96 · Klassik</span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="inline-flex items-center gap-1.5 text-slate-300 hover:text-emerald-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.privacy}</span>
          </button>
          <span className="text-slate-500">100 % Lokal · Ohne Tracking</span>
        </div>
      </footer>
    </div>
  );
};
