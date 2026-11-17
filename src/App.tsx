import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Crown,
  HeartHandshake,
  HelpCircle,
  Map,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Undo2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AdventureMapScreen } from './components/AdventureMapModal';
import { GemIcon, PieceMatrix } from './components/BlockTile';
import { FallingBlockArena } from './components/FallingBlockArena';
import { GameBoard } from './components/GameBoard';
import { GameOverModal } from './components/GameOverModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { PieceDock } from './components/PieceDock';
import { PrivacyModal } from './components/PrivacyModal';
import { RulesModal } from './components/RulesModal';
import { TitleScreen } from './components/TitleScreen';
import {
  getAdventureLevel,
  TOTAL_ADVENTURE_LEVELS,
} from './data/adventureLevels';
import {
  countOccupiedCells,
  createClassicStarterGrid,
  generateBoardClearDeal,
  getBoardClearStage,
} from './data/boardClearPuzzles';
import { generatePieceSet, wrapShapesAsDock } from './data/pieces';
import type {
  AdventureLevelDef,
  BoardClearStageDef,
  ColorId,
  DockPiece,
  DragState,
  GameMode,
  GameState,
  GemType,
  Grid,
  Language,
  LineBlastEffect,
  SavedClassicRun,
  ScorePopup,
} from './types/game';
import {
  canPlacePiece,
  cloneGrid,
  createEmptyGrid,
  getGridSize,
  getPreviewClears,
  hasAnyValidMove,
  placePieceAndResolve,
} from './utils/gameLogic';
import { COPY } from './utils/i18n';
import { soundEngine } from './utils/sound';

const LS_STORAGE_CONSENT = 'bbw_storage_consent_v1';
const LS_HIGHSCORES = 'bbw_highscores_v1';
const LS_SAVED_RUN = 'bbw_saved_run_v1';
const LS_ADVENTURE_PROGRESS = 'bbw_adventure_progress_v1';
const LS_BOARDCLEAR_PROGRESS = 'bbw_boardclear_progress_v1';
const LS_MUTED = 'bbw_muted_v1';
const LS_LANG = 'bbw_lang_v1';

const ALL_LS_KEYS = [
  LS_HIGHSCORES,
  LS_SAVED_RUN,
  LS_ADVENTURE_PROGRESS,
  LS_BOARDCLEAR_PROGRESS,
  LS_MUTED,
  LS_LANG,
  LS_STORAGE_CONSENT,
];

const TOUCH_DRAG_LIFT_PX = 76;

interface UndoSnapshot {
  grid: Grid;
  dock: DockPiece[];
  score: number;
  combo: number;
  turnsSinceClear: number;
  linesCleared: number;
  dealIndex: number;
}

function loadStorageConsent(): boolean {
  try {
    return localStorage.getItem(LS_STORAGE_CONSENT) !== 'false';
  } catch {
    return true;
  }
}

function loadHighScores(): {
  blockblast: number;
  blocksturz: number;
  boardclear: number;
} {
  try {
    const raw = localStorage.getItem(LS_HIGHSCORES);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        blockblast: Number(parsed.blockblast) || 0,
        blocksturz: Number(parsed.blocksturz) || 0,
        boardclear: Number(parsed.boardclear) || 0,
      };
    }
  } catch {
    // Ignore storage errors
  }
  return { blockblast: 0, blocksturz: 0, boardclear: 0 };
}

function loadAdventureProgress(): {
  highestUnlocked: number;
  consecutiveVictories: number;
} {
  try {
    const raw = localStorage.getItem(LS_ADVENTURE_PROGRESS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        highestUnlocked: Math.max(
          1,
          Math.min(TOTAL_ADVENTURE_LEVELS, Number(parsed.highestUnlocked) || 1),
        ),
        consecutiveVictories: Math.max(
          0,
          Number(parsed.consecutiveVictories) || 0,
        ),
      };
    }
  } catch {
    // Ignore storage errors
  }
  return { highestUnlocked: 1, consecutiveVictories: 0 };
}

function loadBoardClearStage(): number {
  try {
    const raw = localStorage.getItem(LS_BOARDCLEAR_PROGRESS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Math.max(1, Number(parsed.stage) || 1);
    }
  } catch {
    // Ignore storage errors
  }
  return 1;
}

function loadSavedRun(): SavedClassicRun | null {
  try {
    const raw = localStorage.getItem(LS_SAVED_RUN);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedClassicRun;
    if (
      parsed &&
      parsed.mode === 'blockblast' &&
      Array.isArray(parsed.grid) &&
      Array.isArray(parsed.dock)
    ) {
      const validGrid = parsed.grid.every(
        (row) =>
          Array.isArray(row) &&
          row.every(
            (cell) =>
              cell === null ||
              (typeof cell === 'object' && typeof cell.color === 'string'),
          ),
      );
      if (validGrid) {
        return {
          ...parsed,
          combo: Number(parsed.combo) || 0,
          turnsSinceClear: Number(parsed.turnsSinceClear) || 0,
          bestCombo: Number(parsed.bestCombo) || 0,
        };
      }
    }
  } catch {
    // Ignore corrupted saved state
  }
  return null;
}

export default function App() {
  const [storageEnabled, setStorageEnabled] =
    useState<boolean>(loadStorageConsent);

  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LS_LANG);
      if (saved === 'en' || saved === 'de') return saved;
    } catch {
      // Ignore
    }
    return 'de';
  });

  const [muted, setMuted] = useState<boolean>(() => {
    try {
      const val = localStorage.getItem(LS_MUTED) === 'true';
      soundEngine.muted = val;
      return val;
    } catch {
      return false;
    }
  });

  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [mode, setMode] = useState<GameMode>('boardclear');
  const [highScores, setHighScores] = useState(loadHighScores);
  const [savedRun, setSavedRun] = useState<SavedClassicRun | null>(loadSavedRun);

  const initialAdv = loadAdventureProgress();
  const [highestUnlocked, setHighestUnlocked] = useState<number>(
    initialAdv.highestUnlocked,
  );
  const [selectedAdventureLevel, setSelectedAdventureLevel] = useState<number>(
    initialAdv.highestUnlocked,
  );
  const [consecutiveVictories, setConsecutiveVictories] = useState<number>(
    initialAdv.consecutiveVictories,
  );
  const [currentAdventureLevel, setCurrentAdventureLevel] =
    useState<AdventureLevelDef | null>(null);
  const [remainingTargets, setRemainingTargets] = useState<
    Partial<Record<GemType, number>>
  >({});

  const [boardClearStage, setBoardClearStage] =
    useState<number>(loadBoardClearStage);
  const [currentBoardClearDef, setCurrentBoardClearDef] =
    useState<BoardClearStageDef | null>(null);
  const [undoStack, setUndoStack] = useState<UndoSnapshot[]>([]);

  const [grid, setGrid] = useState<Grid>(() => createEmptyGrid(8));
  const [dock, setDock] = useState<DockPiece[]>([]);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [turnsSinceClear, setTurnsSinceClear] = useState<number>(0);
  const [bestCombo, setBestCombo] = useState<number>(0);
  const [linesCleared, setLinesCleared] = useState<number>(0);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);
  const [dealKey, setDealKey] = useState<number>(1);
  const [fallingResetToken, setFallingResetToken] = useState<number>(1);

  const [rescueUsed, setRescueUsed] = useState<boolean>(false);
  const [rescuePromptOpen, setRescuePromptOpen] = useState<boolean>(false);

  const [clearingCells, setClearingCells] = useState<Set<string>>(new Set());
  const [recentlyPlacedCells, setRecentlyPlacedCells] = useState<Set<string>>(
    new Set(),
  );
  const [lineBlasts, setLineBlasts] = useState<LineBlastEffect[]>([]);
  const [boardShakeKey, setBoardShakeKey] = useState<number>(0);
  const [allClearWave, setAllClearWave] = useState<boolean>(false);
  const [gameOverFillRow, setGameOverFillRow] = useState<number | null>(null);
  const [noSpaceBanner, setNoSpaceBanner] = useState<boolean>(false);

  const [popups, setPopups] = useState<ScorePopup[]>([]);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [rulesOpen, setRulesOpen] = useState<boolean>(false);
  const [privacyOpen, setPrivacyOpen] = useState<boolean>(false);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [boardCellSize, setBoardCellSize] = useState<number>(42);

  const boardRef = useRef<HTMLDivElement | null>(null);
  const isResolvingRef = useRef<boolean>(false);
  const stageDealIndexRef = useRef<number>(0);
  const storageEnabledRef = useRef<boolean>(storageEnabled);
  storageEnabledRef.current = storageEnabled;

  const lastSnapCellRef = useRef<{ r: number | null; c: number | null }>({
    r: null,
    c: null,
  });
  const pendingDragRef = useRef<{
    piece: DockPiece;
    startX: number;
    startY: number;
    pointerId: number;
    isTouch: boolean;
  } | null>(null);

  const clearTimeoutRef = useRef<number | null>(null);
  const placedTimeoutRef = useRef<number | null>(null);
  const allClearTimeoutRef = useRef<number | null>(null);
  const gameOverIntervalRef = useRef<number | null>(null);

  const t = COPY[language];

  const safeSetLocal = useCallback((key: string, value: string) => {
    if (!storageEnabledRef.current) return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignore storage quota / privacy mode errors
    }
  }, []);

  const clearAllTimers = useCallback(() => {
    if (clearTimeoutRef.current) {
      window.clearTimeout(clearTimeoutRef.current);
      clearTimeoutRef.current = null;
    }
    if (placedTimeoutRef.current) {
      window.clearTimeout(placedTimeoutRef.current);
      placedTimeoutRef.current = null;
    }
    if (allClearTimeoutRef.current) {
      window.clearTimeout(allClearTimeoutRef.current);
      allClearTimeoutRef.current = null;
    }
    if (gameOverIntervalRef.current) {
      window.clearInterval(gameOverIntervalRef.current);
      gameOverIntervalRef.current = null;
    }
  }, []);

  const updateBoardCellSize = useCallback(() => {
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const size = getGridSize(mode);
    const innerWidth = rect.width - 20;
    const gap = 4;
    const computed = Math.max(24, (innerWidth - gap * (size - 1)) / size);
    setBoardCellSize(computed);
  }, [mode]);

  useEffect(() => {
    updateBoardCellSize();
    window.addEventListener('resize', updateBoardCellSize);
    return () => window.removeEventListener('resize', updateBoardCellSize);
  }, [updateBoardCellSize, gameState]);

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  const persistHighScore = useCallback(
    (
      nextScore: number,
      targetMode: 'blockblast' | 'blocksturz' | 'boardclear',
    ) => {
      setHighScores((prev) => {
        if (nextScore <= prev[targetMode]) return prev;
        const updated = { ...prev, [targetMode]: nextScore };
        safeSetLocal(LS_HIGHSCORES, JSON.stringify(updated));
        return updated;
      });
    },
    [safeSetLocal],
  );

  const persistAdventureProgress = useCallback(
    (nextUnlocked: number, nextVictories: number) => {
      setHighestUnlocked(nextUnlocked);
      setConsecutiveVictories(nextVictories);
      safeSetLocal(
        LS_ADVENTURE_PROGRESS,
        JSON.stringify({
          highestUnlocked: nextUnlocked,
          consecutiveVictories: nextVictories,
        }),
      );
    },
    [safeSetLocal],
  );

  const persistBoardClearStage = useCallback(
    (nextStage: number) => {
      setBoardClearStage(nextStage);
      safeSetLocal(
        LS_BOARDCLEAR_PROGRESS,
        JSON.stringify({ stage: nextStage }),
      );
    },
    [safeSetLocal],
  );

  const persistActiveRun = useCallback(
    (run: SavedClassicRun | null) => {
      setSavedRun(run);
      try {
        if (run && storageEnabledRef.current) {
          localStorage.setItem(LS_SAVED_RUN, JSON.stringify(run));
        } else {
          localStorage.removeItem(LS_SAVED_RUN);
        }
      } catch {
        // Ignore
      }
    },
    [],
  );

  const handleToggleStorageConsent = useCallback(
    (enabled: boolean) => {
      setStorageEnabled(enabled);
      storageEnabledRef.current = enabled;
      try {
        if (!enabled) {
          for (const key of ALL_LS_KEYS) {
            localStorage.removeItem(key);
          }
          localStorage.setItem(LS_STORAGE_CONSENT, 'false');
        } else {
          localStorage.setItem(LS_STORAGE_CONSENT, 'true');
          localStorage.setItem(LS_HIGHSCORES, JSON.stringify(highScores));
          localStorage.setItem(
            LS_ADVENTURE_PROGRESS,
            JSON.stringify({
              highestUnlocked,
              consecutiveVictories,
            }),
          );
          localStorage.setItem(
            LS_BOARDCLEAR_PROGRESS,
            JSON.stringify({ stage: boardClearStage }),
          );
          localStorage.setItem(LS_LANG, language);
          localStorage.setItem(LS_MUTED, String(muted));
          if (savedRun) {
            localStorage.setItem(LS_SAVED_RUN, JSON.stringify(savedRun));
          }
        }
      } catch {
        // Ignore
      }
    },
    [
      boardClearStage,
      consecutiveVictories,
      highScores,
      highestUnlocked,
      language,
      muted,
      savedRun,
    ],
  );

  const handleExportData = useCallback(() => {
    const payload = {
      app: 'Blocky',
      version: 1,
      exportedAt: new Date().toISOString(),
      highScores,
      adventureProgress: {
        highestUnlocked,
        consecutiveVictories,
      },
      boardClearStage,
      savedRun,
      language,
      muted,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `blocky-spielstand-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [
    boardClearStage,
    consecutiveVictories,
    highScores,
    highestUnlocked,
    language,
    muted,
    savedRun,
  ]);

  const handleImportData = useCallback(
    (jsonText: string): boolean => {
      try {
        const parsed = JSON.parse(jsonText);
        if (!parsed || typeof parsed !== 'object') return false;

        if (parsed.highScores && typeof parsed.highScores === 'object') {
          const nextHS = {
            blockblast: Math.max(0, Number(parsed.highScores.blockblast) || 0),
            blocksturz: Math.max(0, Number(parsed.highScores.blocksturz) || 0),
            boardclear: Math.max(0, Number(parsed.highScores.boardclear) || 0),
          };
          setHighScores(nextHS);
          safeSetLocal(LS_HIGHSCORES, JSON.stringify(nextHS));
        }

        if (
          parsed.adventureProgress &&
          typeof parsed.adventureProgress === 'object'
        ) {
          const nextAdv = Math.max(
            1,
            Math.min(
              TOTAL_ADVENTURE_LEVELS,
              Number(parsed.adventureProgress.highestUnlocked) || 1,
            ),
          );
          const nextStreak = Math.max(
            0,
            Number(parsed.adventureProgress.consecutiveVictories) || 0,
          );
          setHighestUnlocked(nextAdv);
          setSelectedAdventureLevel(nextAdv);
          setConsecutiveVictories(nextStreak);
          safeSetLocal(
            LS_ADVENTURE_PROGRESS,
            JSON.stringify({
              highestUnlocked: nextAdv,
              consecutiveVictories: nextStreak,
            }),
          );
        }

        if (parsed.boardClearStage !== undefined) {
          const nextStg = Math.max(1, Number(parsed.boardClearStage) || 1);
          setBoardClearStage(nextStg);
          safeSetLocal(
            LS_BOARDCLEAR_PROGRESS,
            JSON.stringify({ stage: nextStg }),
          );
        }

        if (parsed.language === 'de' || parsed.language === 'en') {
          setLanguage(parsed.language);
          safeSetLocal(LS_LANG, parsed.language);
        }

        if (typeof parsed.muted === 'boolean') {
          setMuted(parsed.muted);
          soundEngine.muted = parsed.muted;
          safeSetLocal(LS_MUTED, String(parsed.muted));
        }

        return true;
      } catch {
        return false;
      }
    },
    [safeSetLocal],
  );

  const handleClearAllData = useCallback(() => {
    try {
      for (const key of ALL_LS_KEYS) {
        localStorage.removeItem(key);
      }
      if (!storageEnabledRef.current) {
        localStorage.setItem(LS_STORAGE_CONSENT, 'false');
      }
    } catch {
      // Ignore
    }
    setHighScores({ blockblast: 0, blocksturz: 0, boardclear: 0 });
    setHighestUnlocked(1);
    setSelectedAdventureLevel(1);
    setConsecutiveVictories(0);
    setBoardClearStage(1);
    setSavedRun(null);
    setUndoStack([]);
  }, []);

  const handleToggleLanguage = (lang: Language) => {
    setLanguage(lang);
    safeSetLocal(LS_LANG, lang);
  };

  const handleToggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      soundEngine.muted = next;
      safeSetLocal(LS_MUTED, String(next));
      return next;
    });
  }, [safeSetLocal]);

  const resetVisualEffects = useCallback(() => {
    setClearingCells(new Set());
    setRecentlyPlacedCells(new Set());
    setLineBlasts([]);
    setBoardShakeKey(0);
    setAllClearWave(false);
    setGameOverFillRow(null);
    setNoSpaceBanner(false);
    setRescuePromptOpen(false);
    setPopups([]);
    setSelectedUid(null);
    setDragState(null);
  }, []);

  const startAdventureLevel = useCallback(
    (levelNum: number) => {
      clearAllTimers();
      isResolvingRef.current = false;

      const levelDef = getAdventureLevel(levelNum);
      const freshGrid = cloneGrid(levelDef.initialGrid);
      const initTargets: Partial<Record<GemType, number>> = levelDef.targets
        ? { ...levelDef.targets }
        : {};
      const freshDock = generatePieceSet(
        freshGrid,
        'adventure',
        levelDef.type === 'collect' ? initTargets : undefined,
      );

      setMode('adventure');
      setSelectedAdventureLevel(levelDef.level);
      setCurrentAdventureLevel(levelDef);
      setCurrentBoardClearDef(null);
      setRemainingTargets(initTargets);
      setUndoStack([]);
      setRescueUsed(false);
      setGrid(freshGrid);
      setDock(freshDock);
      setScore(0);
      setCombo(0);
      setTurnsSinceClear(0);
      setBestCombo(0);
      setLinesCleared(0);
      setIsNewRecord(false);
      resetVisualEffects();
      setDealKey((k) => k + 1);
      setGameState('PLAYING');
      soundEngine.playDeal();
    },
    [clearAllTimers, resetVisualEffects],
  );

  const startBoardClearStage = useCallback(
    (stageNum: number, keepScore = false) => {
      clearAllTimers();
      isResolvingRef.current = false;

      const stageDef = getBoardClearStage(stageNum);
      const freshGrid = cloneGrid(stageDef.initialGrid);
      stageDealIndexRef.current = 0;

      const freshDock =
        stageDef.presetDeals && stageDef.presetDeals.length > 0
          ? wrapShapesAsDock(stageDef.presetDeals[0])
          : generateBoardClearDeal(freshGrid);

      setMode('boardclear');
      setCurrentBoardClearDef(stageDef);
      setCurrentAdventureLevel(null);
      setRemainingTargets({});
      setUndoStack([]);
      setRescueUsed(false);
      setGrid(freshGrid);
      setDock(freshDock);
      if (!keepScore) {
        setScore(0);
        setCombo(0);
        setTurnsSinceClear(0);
        setBestCombo(0);
        setLinesCleared(0);
        setIsNewRecord(false);
      }
      resetVisualEffects();
      setDealKey((k) => k + 1);
      setGameState('PLAYING');
      soundEngine.playDeal();
    },
    [clearAllTimers, resetVisualEffects],
  );

  const startFreshGame = useCallback(
    (targetMode: GameMode) => {
      if (targetMode === 'adventure') {
        startAdventureLevel(selectedAdventureLevel);
        return;
      }
      if (targetMode === 'boardclear') {
        startBoardClearStage(boardClearStage, false);
        return;
      }

      clearAllTimers();
      isResolvingRef.current = false;

      if (targetMode === 'blocksturz') {
        setMode('blocksturz');
        setCurrentAdventureLevel(null);
        setCurrentBoardClearDef(null);
        setUndoStack([]);
        setRescueUsed(false);
        setScore(0);
        setCombo(0);
        setTurnsSinceClear(0);
        setBestCombo(0);
        setLinesCleared(0);
        setIsNewRecord(false);
        resetVisualEffects();
        setFallingResetToken((n) => n + 1);
        setGameState('PLAYING');
        soundEngine.playDeal();
        return;
      }

      const freshGrid = createClassicStarterGrid();
      const freshDock = generatePieceSet(freshGrid, 'blockblast');

      setMode('blockblast');
      setCurrentAdventureLevel(null);
      setCurrentBoardClearDef(null);
      setRemainingTargets({});
      setUndoStack([]);
      setRescueUsed(false);
      setGrid(freshGrid);
      setDock(freshDock);
      setScore(0);
      setCombo(0);
      setTurnsSinceClear(0);
      setBestCombo(0);
      setLinesCleared(0);
      setIsNewRecord(false);
      resetVisualEffects();
      setDealKey((k) => k + 1);
      setGameState('PLAYING');

      persistActiveRun({
        mode: 'blockblast',
        grid: freshGrid,
        dock: freshDock,
        score: 0,
        combo: 0,
        turnsSinceClear: 0,
        linesCleared: 0,
        bestCombo: 0,
      });

      soundEngine.playDeal();
    },
    [
      boardClearStage,
      clearAllTimers,
      persistActiveRun,
      resetVisualEffects,
      selectedAdventureLevel,
      startAdventureLevel,
      startBoardClearStage,
    ],
  );

  const triggerGameOverSequence = useCallback(() => {
    if (mode === 'adventure') {
      persistAdventureProgress(highestUnlocked, 0);
    } else if (mode === 'boardclear') {
      setConsecutiveVictories(0);
    } else if (mode === 'blockblast') {
      persistActiveRun(null);
    }

    isResolvingRef.current = true;
    setRescuePromptOpen(false);
    setNoSpaceBanner(true);
    soundEngine.playGameOver();

    let currentRow = 7;
    setGameOverFillRow(currentRow);

    if (gameOverIntervalRef.current) {
      window.clearInterval(gameOverIntervalRef.current);
    }
    gameOverIntervalRef.current = window.setInterval(() => {
      currentRow -= 1;
      if (currentRow >= 0) {
        setGameOverFillRow(currentRow);
      } else {
        if (gameOverIntervalRef.current) {
          window.clearInterval(gameOverIntervalRef.current);
          gameOverIntervalRef.current = null;
        }
        window.setTimeout(() => {
          setNoSpaceBanner(false);
          setGameOverFillRow(null);
          isResolvingRef.current = false;
          setGameState('GAME_OVER');
        }, 220);
      }
    }, 55);
  }, [highestUnlocked, mode, persistActiveRun, persistAdventureProgress]);

  const spawnLineBlast = useCallback(
    (rows: number[], cols: number[], color: ColorId) => {
      if (rows.length === 0 && cols.length === 0) return;
      const id = `blast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      setLineBlasts((prev) => [...prev, { id, rows, cols, color }]);
      window.setTimeout(() => {
        setLineBlasts((prev) => prev.filter((b) => b.id !== id));
      }, 480);
    },
    [],
  );

  // 1x Free Rescue ("2. Chance"): Clears center rows & deals 3 playable pieces!
  const handleAcceptRescue = useCallback(() => {
    setRescuePromptOpen(false);
    setRescueUsed(true);

    const rescuedGrid = cloneGrid(grid);
    const clearedRows = [2, 3, 4, 5];
    const nextRemTargets = { ...remainingTargets };

    for (const r of clearedRows) {
      for (let c = 0; c < 8; c++) {
        const cell = rescuedGrid[r][c];
        if (
          cell?.gem &&
          mode === 'adventure' &&
          currentAdventureLevel?.type === 'collect'
        ) {
          if (nextRemTargets[cell.gem] !== undefined) {
            nextRemTargets[cell.gem] = Math.max(
              0,
              (nextRemTargets[cell.gem] ?? 0) - 1,
            );
          }
        }
        rescuedGrid[r][c] = null;
      }
    }

    if (mode === 'adventure' && currentAdventureLevel?.type === 'collect') {
      setRemainingTargets(nextRemTargets);
    }

    spawnLineBlast(clearedRows, [], 'cyan');
    setBoardShakeKey((k) => k + 1);
    soundEngine.playClear(4, Math.max(1, combo));

    // Check if clearing center rows already completed the level/stage!
    const allEmptyNow = countOccupiedCells(rescuedGrid) === 0;
    if (mode === 'boardclear' && allEmptyNow && currentBoardClearDef) {
      setGrid(rescuedGrid);
      const nextStage = currentBoardClearDef.stage + 1;
      persistBoardClearStage(nextStage);
      setConsecutiveVictories((s) => s + 1);
      soundEngine.playAllClear();
      window.setTimeout(() => {
        soundEngine.playLevelWin();
        setGameState('LEVEL_COMPLETE');
        isResolvingRef.current = false;
      }, 420);
      return;
    }

    if (
      mode === 'adventure' &&
      currentAdventureLevel?.type === 'collect' &&
      Object.values(nextRemTargets).every((v) => (v ?? 0) <= 0)
    ) {
      setGrid(rescuedGrid);
      const nextUnlocked = Math.min(
        TOTAL_ADVENTURE_LEVELS,
        Math.max(highestUnlocked, currentAdventureLevel.level + 1),
      );
      persistAdventureProgress(nextUnlocked, consecutiveVictories + 1);
      setSelectedAdventureLevel(nextUnlocked);
      soundEngine.playLevelWin();
      setGameState('LEVEL_COMPLETE');
      isResolvingRef.current = false;
      return;
    }

    const freshDock =
      mode === 'boardclear'
        ? generateBoardClearDeal(rescuedGrid)
        : generatePieceSet(
            rescuedGrid,
            mode,
            mode === 'adventure' && currentAdventureLevel?.type === 'collect'
              ? nextRemTargets
              : undefined,
          );

    setGrid(rescuedGrid);
    setDock(freshDock);
    setDealKey((k) => k + 1);
    soundEngine.playDeal();
    isResolvingRef.current = false;
  }, [
    combo,
    consecutiveVictories,
    currentAdventureLevel,
    currentBoardClearDef,
    grid,
    highestUnlocked,
    mode,
    persistAdventureProgress,
    persistBoardClearStage,
    remainingTargets,
    spawnLineBlast,
  ]);

  const handleUndoBoardClear = useCallback(() => {
    if (mode !== 'boardclear' || isResolvingRef.current) return;
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setGrid(last.grid);
      setDock(last.dock);
      setScore(last.score);
      setCombo(last.combo);
      setTurnsSinceClear(last.turnsSinceClear);
      setLinesCleared(last.linesCleared);
      stageDealIndexRef.current = last.dealIndex;
      setSelectedUid(null);
      soundEngine.playPickup();
      return prev.slice(0, -1);
    });
  }, [mode]);

  const handleFallingScoreChange = useCallback(
    (nextScore: number, nextLines: number, nextBestStreak: number) => {
      setScore(nextScore);
      setLinesCleared(nextLines);
      setBestCombo(nextBestStreak);
      if (nextScore > highScores.blocksturz) {
        setIsNewRecord(true);
        persistHighScore(nextScore, 'blocksturz');
      }
    },
    [highScores.blocksturz, persistHighScore],
  );

  const handleFallingGameOver = useCallback(
    (finalScore: number, totalLines: number, finalBestStreak: number) => {
      setScore(finalScore);
      setLinesCleared(totalLines);
      setBestCombo(finalBestStreak);
      if (finalScore > highScores.blocksturz) {
        setIsNewRecord(true);
      }
      persistHighScore(finalScore, 'blocksturz');
      setGameState('GAME_OVER');
    },
    [highScores.blocksturz, persistHighScore],
  );

  const resumeSavedGame = useCallback(() => {
    if (!savedRun) return;
    clearAllTimers();
    isResolvingRef.current = false;
    setMode('blockblast');
    setCurrentAdventureLevel(null);
    setCurrentBoardClearDef(null);
    setRemainingTargets({});
    setUndoStack([]);
    setRescueUsed(false);
    setGrid(savedRun.grid);
    setDock(savedRun.dock);
    setScore(savedRun.score);
    setCombo(savedRun.combo);
    setTurnsSinceClear(savedRun.turnsSinceClear);
    setLinesCleared(savedRun.linesCleared);
    setBestCombo(savedRun.bestCombo);
    setIsNewRecord(false);
    resetVisualEffects();
    setGameState('PLAYING');
  }, [clearAllTimers, resetVisualEffects, savedRun]);

  const spawnPopup = useCallback(
    (
      points: number,
      row: number,
      col: number,
      options: {
        label?: string;
        praise?: string;
        comboCount?: number;
        isAllClear?: boolean;
      } = {},
    ) => {
      const id = `pop_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      setPopups((prev) => [...prev, { id, points, row, col, ...options }]);
      window.setTimeout(() => {
        setPopups((prev) => prev.filter((p) => p.id !== id));
      }, 1050);
    },
    [],
  );

  const commitPiecePlacement = useCallback(
    (pieceUid: string, targetRow: number, targetCol: number) => {
      if (isResolvingRef.current || gameState !== 'PLAYING') return;

      const pieceObj = dock.find((d) => d.uid === pieceUid && !d.used);
      if (!pieceObj) return;

      if (!canPlacePiece(grid, pieceObj.shape.matrix, targetRow, targetCol)) {
        soundEngine.playInvalid();
        return;
      }

      if (mode === 'boardclear') {
        const snapshot: UndoSnapshot = {
          grid: cloneGrid(grid),
          dock: dock.map((d) => ({ ...d })),
          score,
          combo,
          turnsSinceClear,
          linesCleared,
          dealIndex: stageDealIndexRef.current,
        };
        setUndoStack((prev) => [...prev.slice(-11), snapshot]);
      }

      isResolvingRef.current = true;
      setSelectedUid(null);

      const placedSet = new Set<string>();
      for (let pr = 0; pr < pieceObj.shape.matrix.length; pr++) {
        for (let pc = 0; pc < pieceObj.shape.matrix[0].length; pc++) {
          if (pieceObj.shape.matrix[pr][pc] === 1) {
            placedSet.add(`${targetRow + pr},${targetCol + pc}`);
          }
        }
      }
      setRecentlyPlacedCells(placedSet);
      if (placedTimeoutRef.current) {
        window.clearTimeout(placedTimeoutRef.current);
      }
      placedTimeoutRef.current = window.setTimeout(() => {
        setRecentlyPlacedCells(new Set());
      }, 200);

      const resolution = placePieceAndResolve(
        grid,
        pieceObj.shape,
        targetRow,
        targetCol,
        combo,
        turnsSinceClear,
        linesCleared,
      );

      const nextScore = score + resolution.pointsEarned;
      const nextBestCombo = Math.max(bestCombo, resolution.newCombo);
      const nextLinesCleared = linesCleared + resolution.clearInfo.linesCount;

      if (mode === 'blockblast') {
        if (nextScore > highScores.blockblast) {
          setIsNewRecord(true);
        }
        persistHighScore(nextScore, 'blockblast');
      } else if (mode === 'boardclear') {
        if (nextScore > highScores.boardclear) {
          setIsNewRecord(true);
        }
        persistHighScore(nextScore, 'boardclear');
      }

      const nextRemainingTargets: Partial<Record<GemType, number>> = {
        ...remainingTargets,
      };
      if (mode === 'adventure' && currentAdventureLevel?.type === 'collect') {
        for (const [gem, count] of Object.entries(
          resolution.collectedGems,
        ) as [GemType, number][]) {
          if (nextRemainingTargets[gem] !== undefined) {
            nextRemainingTargets[gem] = Math.max(
              0,
              (nextRemainingTargets[gem] ?? 0) - count,
            );
          }
        }
        setRemainingTargets(nextRemainingTargets);
      }

      const adventureWon =
        mode === 'adventure' &&
        currentAdventureLevel !== null &&
        (currentAdventureLevel.type === 'score'
          ? nextScore >= (currentAdventureLevel.targetScore ?? 0)
          : Object.values(nextRemainingTargets).every((v) => (v ?? 0) <= 0));

      const boardClearStageWon = mode === 'boardclear' && resolution.allClear;

      setScore(nextScore);
      setCombo(resolution.newCombo);
      setTurnsSinceClear(resolution.newTurnsSinceClear);
      setBestCombo(nextBestCombo);
      setLinesCleared(nextLinesCleared);

      const updatedDock = dock.map((d) =>
        d.uid === pieceUid ? { ...d, used: true } : d,
      );

      let popupPraise: string | undefined;
      if (resolution.allClear) {
        popupPraise = t.praiseUnbelievable;
      } else if (resolution.clearInfo.linesCount >= 3) {
        popupPraise = t.praiseExcellent;
      } else if (resolution.clearInfo.linesCount === 2) {
        popupPraise = t.praiseGreat;
      } else if (resolution.newCombo >= 4) {
        popupPraise = t.praiseGreat;
      } else if (resolution.clearInfo.linesCount === 1) {
        popupPraise = t.praiseGood;
      }

      if (resolution.allClear) {
        soundEngine.playAllClear();
        spawnLineBlast(
          resolution.clearInfo.rows,
          resolution.clearInfo.cols,
          pieceObj.shape.color,
        );
        setBoardShakeKey((k) => k + 1);
        setAllClearWave(true);
        if (allClearTimeoutRef.current) {
          window.clearTimeout(allClearTimeoutRef.current);
        }
        allClearTimeoutRef.current = window.setTimeout(() => {
          setAllClearWave(false);
        }, 720);

        spawnPopup(resolution.pointsEarned, 3.5, 3.5, {
          praise: popupPraise,
          comboCount:
            resolution.newCombo >= 2 ? resolution.newCombo : undefined,
          isAllClear: true,
        });
      } else if (resolution.clearInfo.linesCount > 0) {
        soundEngine.playClear(
          resolution.clearInfo.linesCount,
          resolution.newCombo,
        );
        spawnLineBlast(
          resolution.clearInfo.rows,
          resolution.clearInfo.cols,
          pieceObj.shape.color,
        );
        if (resolution.clearInfo.linesCount >= 2 || resolution.newCombo >= 3) {
          setBoardShakeKey((k) => k + 1);
        }
        spawnPopup(
          resolution.pointsEarned,
          resolution.placedCenterRow,
          resolution.placedCenterCol,
          {
            praise: popupPraise,
            comboCount:
              resolution.newCombo >= 1 ? resolution.newCombo : undefined,
          },
        );
      } else {
        soundEngine.playPlace();
        spawnPopup(
          resolution.pointsEarned,
          resolution.placedCenterRow,
          resolution.placedCenterCol,
        );
      }

      const finalizeTurn = (settledGrid: Grid) => {
        if (boardClearStageWon && currentBoardClearDef) {
          setGrid(settledGrid);
          setDock(updatedDock);
          setClearingCells(new Set());
          setUndoStack([]);

          const nextStage = currentBoardClearDef.stage + 1;
          const nextStreak = consecutiveVictories + 1;
          persistBoardClearStage(nextStage);
          setConsecutiveVictories(nextStreak);

          window.setTimeout(() => {
            soundEngine.playLevelWin();
            setGameState('LEVEL_COMPLETE');
            isResolvingRef.current = false;
          }, 520);
          return;
        }

        if (adventureWon && currentAdventureLevel) {
          setGrid(settledGrid);
          setDock(updatedDock);
          setClearingCells(new Set());

          const nextUnlocked = Math.min(
            TOTAL_ADVENTURE_LEVELS,
            Math.max(highestUnlocked, currentAdventureLevel.level + 1),
          );
          const nextStreak = consecutiveVictories + 1;
          persistAdventureProgress(nextUnlocked, nextStreak);
          setSelectedAdventureLevel(nextUnlocked);
          soundEngine.playLevelWin();
          setGameState('LEVEL_COMPLETE');
          isResolvingRef.current = false;
          return;
        }

        const allUsed = updatedDock.every((d) => d.used);
        let nextDock = updatedDock;

        if (allUsed) {
          if (mode === 'boardclear') {
            stageDealIndexRef.current += 1;
            const preset =
              currentBoardClearDef?.presetDeals?.[stageDealIndexRef.current];
            const presetDock = preset ? wrapShapesAsDock(preset) : null;
            nextDock =
              presetDock && hasAnyValidMove(settledGrid, presetDock)
                ? presetDock
                : generateBoardClearDeal(settledGrid);
          } else {
            nextDock = generatePieceSet(
              settledGrid,
              mode,
              mode === 'adventure' && currentAdventureLevel?.type === 'collect'
                ? nextRemainingTargets
                : undefined,
            );
          }
          setDealKey((k) => k + 1);
          soundEngine.playDeal();
        }

        setGrid(settledGrid);
        setDock(nextDock);
        setClearingCells(new Set());

        const canContinue = hasAnyValidMove(settledGrid, nextDock);
        if (!canContinue) {
          if (!rescueUsed) {
            // Offer 1x Free Rescue before Game Over!
            soundEngine.playInvalid();
            setRescuePromptOpen(true);
          } else {
            triggerGameOverSequence();
          }
        } else {
          if (mode === 'blockblast') {
            persistActiveRun({
              mode: 'blockblast',
              grid: settledGrid,
              dock: nextDock,
              score: nextScore,
              combo: resolution.newCombo,
              turnsSinceClear: resolution.newTurnsSinceClear,
              linesCleared: nextLinesCleared,
              bestCombo: nextBestCombo,
            });
          }
          isResolvingRef.current = false;
        }
      };

      if (resolution.clearInfo.clearedCells.size > 0) {
        const unifiedPlacedGrid = cloneGrid(resolution.placedGrid);
        for (const key of resolution.clearInfo.clearedCells) {
          const [rs, cs] = key.split(',');
          const rr = Number(rs);
          const cc = Number(cs);
          const existing = unifiedPlacedGrid[rr][cc];
          if (existing && !existing.gem) {
            unifiedPlacedGrid[rr][cc] = {
              ...existing,
              color: pieceObj.shape.color,
            };
          }
        }

        setGrid(unifiedPlacedGrid);
        setDock(updatedDock);
        setClearingCells(resolution.clearInfo.clearedCells);

        if (clearTimeoutRef.current) {
          window.clearTimeout(clearTimeoutRef.current);
        }
        clearTimeoutRef.current = window.setTimeout(() => {
          finalizeTurn(resolution.finalGrid);
        }, 240);
      } else {
        finalizeTurn(resolution.finalGrid);
      }
    },
    [
      bestCombo,
      combo,
      consecutiveVictories,
      currentAdventureLevel,
      currentBoardClearDef,
      dock,
      gameState,
      grid,
      highScores.blockblast,
      highScores.boardclear,
      highestUnlocked,
      linesCleared,
      mode,
      persistActiveRun,
      persistAdventureProgress,
      persistBoardClearStage,
      persistHighScore,
      remainingTargets,
      rescueUsed,
      score,
      spawnLineBlast,
      spawnPopup,
      t,
      triggerGameOverSequence,
      turnsSinceClear,
    ],
  );

  const getGridTargetFromPointer = useCallback(
    (
      pointerX: number,
      pointerY: number,
      matrix: number[][],
      isTouch: boolean,
    ): { row: number | null; col: number | null } => {
      if (!boardRef.current) return { row: null, col: null };
      const rect = boardRef.current.getBoundingClientRect();
      const size = getGridSize(mode);
      const pad = 10;
      const innerLeft = rect.left + pad;
      const innerTop = rect.top + pad;
      const innerSize = rect.width - pad * 2;
      const cellStep = innerSize / size;

      const liftedY = isTouch ? pointerY - TOUCH_DRAG_LIFT_PX : pointerY;
      const pieceRows = matrix.length;
      const pieceCols = matrix[0].length;

      const pieceWidth = pieceCols * cellStep;
      const pieceHeight = pieceRows * cellStep;

      const pieceTopLeftX = pointerX - pieceWidth / 2;
      const pieceTopLeftY = liftedY - pieceHeight / 2;

      const col = Math.round((pieceTopLeftX - innerLeft) / cellStep);
      const row = Math.round((pieceTopLeftY - innerTop) / cellStep);

      const margin = cellStep * 1.1;
      if (
        pointerX < rect.left - margin ||
        pointerX > rect.right + margin ||
        liftedY < rect.top - margin ||
        liftedY > rect.bottom + margin
      ) {
        return { row: null, col: null };
      }

      if (
        row < 0 ||
        col < 0 ||
        row + pieceRows > size ||
        col + pieceCols > size
      ) {
        return { row: null, col: null };
      }

      return { row, col };
    },
    [mode],
  );

  const handleStartDrag = (
    e: React.PointerEvent<HTMLDivElement>,
    piece: DockPiece,
  ) => {
    if (isResolvingRef.current || piece.used) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    updateBoardCellSize();
    const isTouch = e.pointerType === 'touch';
    lastSnapCellRef.current = { r: null, c: null };

    pendingDragRef.current = {
      piece,
      startX: e.clientX,
      startY: e.clientY,
      pointerId: e.pointerId,
      isTouch,
    };
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const pending = pendingDragRef.current;

      if (pending && !dragState) {
        const dx = e.clientX - pending.startX;
        const dy = e.clientY - pending.startY;
        if (Math.hypot(dx, dy) >= 5) {
          soundEngine.playPickup();
          setSelectedUid(null);
          const { row, col } = getGridTargetFromPointer(
            e.clientX,
            e.clientY,
            pending.piece.shape.matrix,
            pending.isTouch,
          );
          const valid =
            row !== null &&
            col !== null &&
            canPlacePiece(grid, pending.piece.shape.matrix, row, col);
          const preview =
            valid && row !== null && col !== null
              ? getPreviewClears(grid, pending.piece.shape, row, col)
              : null;

          lastSnapCellRef.current = { r: row, c: col };

          setDragState({
            pieceUid: pending.piece.uid,
            shape: pending.piece.shape,
            pointerX: e.clientX,
            pointerY: e.clientY,
            isTouch: pending.isTouch,
            hoverRow: row,
            hoverCol: col,
            isValidDrop: valid,
            preview,
          });
        }
        return;
      }

      if (dragState) {
        const { row, col } = getGridTargetFromPointer(
          e.clientX,
          e.clientY,
          dragState.shape.matrix,
          dragState.isTouch,
        );
        const valid =
          row !== null &&
          col !== null &&
          canPlacePiece(grid, dragState.shape.matrix, row, col);
        const preview =
          valid && row !== null && col !== null
            ? getPreviewClears(grid, dragState.shape, row, col)
            : null;

        if (
          valid &&
          (row !== lastSnapCellRef.current.r ||
            col !== lastSnapCellRef.current.c)
        ) {
          lastSnapCellRef.current = { r: row, c: col };
          soundEngine.playHoverSnap();
        } else if (!valid) {
          lastSnapCellRef.current = { r: null, c: null };
        }

        setDragState((prev) =>
          prev
            ? {
                ...prev,
                pointerX: e.clientX,
                pointerY: e.clientY,
                hoverRow: row,
                hoverCol: col,
                isValidDrop: valid,
                preview,
              }
            : null,
        );
      }
    };

    const handlePointerUp = () => {
      if (dragState) {
        if (
          dragState.isValidDrop &&
          dragState.hoverRow !== null &&
          dragState.hoverCol !== null
        ) {
          commitPiecePlacement(
            dragState.pieceUid,
            dragState.hoverRow,
            dragState.hoverCol,
          );
        } else if (
          dragState.hoverRow !== null &&
          dragState.hoverCol !== null &&
          !dragState.isValidDrop
        ) {
          soundEngine.playInvalid();
        }
        setDragState(null);
      }
      pendingDragRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove, {
      passive: true,
    });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [commitPiecePlacement, dragState, getGridTargetFromPointer, grid]);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1' || e.key === '2' || e.key === '3') {
        const idx = Number(e.key) - 1;
        const target = dock[idx];
        if (target && !target.used) {
          setSelectedUid((prev) => (prev === target.uid ? null : target.uid));
        }
      } else if (e.key === 'Escape') {
        setSelectedUid(null);
      } else if (e.key.toLowerCase() === 'm') {
        handleToggleMute();
      } else if (
        (e.key.toLowerCase() === 'z' && (e.ctrlKey || e.metaKey)) ||
        e.key.toLowerCase() === 'u'
      ) {
        handleUndoBoardClear();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dock, gameState, handleToggleMute, handleUndoBoardClear]);

  const selectedPieceObj = dock.find(
    (d) => d.uid === selectedUid && !d.used,
  );

  if (gameState === 'TITLE_MENU') {
    return (
      <>
        <TitleScreen
          selectedMode={mode}
          onSelectMode={setMode}
          highScores={highScores}
          adventureProgress={highestUnlocked}
          boardClearStage={boardClearStage}
          savedRun={savedRun}
          language={language}
          onToggleLanguage={handleToggleLanguage}
          onStartNewGame={startFreshGame}
          onOpenAdventureMap={() => setGameState('ADVENTURE_MAP')}
          onResumeGame={resumeSavedGame}
          onOpenRules={() => setRulesOpen(true)}
          onOpenPrivacy={() => setPrivacyOpen(true)}
        />
        <RulesModal
          open={rulesOpen}
          language={language}
          onClose={() => setRulesOpen(false)}
        />
        <PrivacyModal
          open={privacyOpen}
          language={language}
          storageEnabled={storageEnabled}
          onToggleStorage={handleToggleStorageConsent}
          onExportData={handleExportData}
          onImportData={handleImportData}
          onClearAllData={handleClearAllData}
          onClose={() => setPrivacyOpen(false)}
        />
      </>
    );
  }

  if (gameState === 'ADVENTURE_MAP') {
    return (
      <AdventureMapScreen
        highestUnlocked={highestUnlocked}
        selectedLevel={selectedAdventureLevel}
        consecutiveVictories={consecutiveVictories}
        language={language}
        onSelectLevel={setSelectedAdventureLevel}
        onStartLevel={startAdventureLevel}
        onBack={() => setGameState('TITLE_MENU')}
      />
    );
  }

  const currentStageTitle = currentBoardClearDef
    ? language === 'de'
      ? currentBoardClearDef.titleDe
      : currentBoardClearDef.titleEn
    : undefined;

  const headerModeLabel =
    mode === 'adventure' && currentAdventureLevel
      ? `${t.levelLabel} ${currentAdventureLevel.level}`
      : mode === 'boardclear' && currentBoardClearDef
        ? `${t.stageLabel} ${currentBoardClearDef.stage} · ${currentStageTitle}`
        : mode === 'blocksturz'
          ? t.modeBlocksturz
          : t.modeBlockBlast;

  const remainingBlocksCount =
    mode === 'boardclear' ? countOccupiedCells(grid) : 0;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#1E2A5A] bg-gradient-to-b from-[#23336D] via-[#1B2856] to-[#131C3E] text-slate-100 select-none overflow-hidden touch-none">
      {/* Compact 3-Zone Top Bar */}
      <header className="w-full max-w-4xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 border-b border-white/10">
        <button
          type="button"
          onClick={() => {
            clearAllTimers();
            isResolvingRef.current = false;
            setGameState(mode === 'adventure' ? 'ADVENTURE_MAP' : 'TITLE_MENU');
          }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-200 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {mode === 'adventure' ? (
            <Map className="w-4 h-4" />
          ) : (
            <ArrowLeft className="w-4 h-4" />
          )}
          <span>{mode === 'adventure' ? t.backToMap : t.home}</span>
        </button>

        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-200 truncate">
          <span className="font-display font-bold text-white truncate">
            {headerModeLabel}
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {mode === 'boardclear' && undoStack.length > 0 && (
            <button
              type="button"
              onClick={handleUndoBoardClear}
              aria-label={t.undo}
              title={t.undo}
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/35 border border-purple-300/35 text-xs font-semibold text-purple-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.undo}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleMute}
            aria-label={muted ? t.soundOff : t.soundOn}
            title={muted ? t.soundOff : t.soundOn}
            className="p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            {muted ? (
              <VolumeX className="w-4 h-4 text-slate-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setRulesOpen(true)}
            aria-label={t.rules}
            title={t.rules}
            className="p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setPrivacyOpen(true)}
            aria-label={t.privacy}
            title={t.privacy}
            className="p-2 rounded-lg text-slate-200 hover:text-emerald-300 hover:bg-white/10 transition-colors cursor-pointer hidden sm:inline-flex"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (mode === 'adventure' && currentAdventureLevel) {
                startAdventureLevel(currentAdventureLevel.level);
              } else if (mode === 'boardclear' && currentBoardClearDef) {
                startBoardClearStage(currentBoardClearDef.stage, false);
              } else {
                startFreshGame(mode);
              }
            }}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-xs sm:text-sm font-medium text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.newGame}</span>
          </button>
        </div>
      </header>

      {/* Main Play Arena */}
      <main className="flex-1 flex flex-col justify-center w-full max-w-xl mx-auto px-3 sm:px-5 py-2 sm:py-4">
        {mode === 'blocksturz' ? (
          <FallingBlockArena
            language={language}
            highScore={highScores.blocksturz}
            resetToken={fallingResetToken}
            isGameOver={gameState === 'GAME_OVER'}
            onScoreChange={handleFallingScoreChange}
            onGameOver={handleFallingGameOver}
          />
        ) : (
          <>
            {/* Mode-Specific HUD */}
            {mode === 'adventure' && currentAdventureLevel ? (
              <div className="w-full max-w-[min(92vw,47dvh)] sm:max-w-[460px] mx-auto pb-2.5 sm:pb-3.5">
                {currentAdventureLevel.type === 'score' ? (
                  <div className="space-y-1.5">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <div className="text-xs text-slate-300 font-medium">
                          {t.targetScoreLabel}
                        </div>
                        <div className="font-mono-num font-bold text-2xl sm:text-3xl text-white leading-none mt-0.5">
                          {score.toLocaleString()}{' '}
                          <span className="text-base sm:text-lg text-amber-300 font-semibold">
                            /{' '}
                            {(
                              currentAdventureLevel.targetScore ?? 0
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {combo > 1 && (
                        <div className="text-right">
                          <div className="text-xs text-amber-300 font-medium">
                            {t.combo}
                          </div>
                          <div className="font-mono-num font-bold text-lg text-amber-300 leading-tight">
                            {combo}×
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[#131B2E] border border-white/15 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-200"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              (score /
                                Math.max(
                                  1,
                                  currentAdventureLevel.targetScore ?? 1,
                                )) *
                                100,
                            ),
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center flex-wrap gap-2 sm:gap-3">
                      {(
                        Object.entries(
                          currentAdventureLevel.targets ?? {},
                        ) as [GemType, number][]
                      ).map(([gem]) => {
                        const rem = remainingTargets[gem] ?? 0;
                        const done = rem <= 0;
                        return (
                          <div
                            key={gem}
                            className="flex items-center gap-1.5 bg-[#131B2E] border border-white/15 rounded-lg px-2.5 py-1.5"
                          >
                            <GemIcon gem={gem} className="w-5 h-5" />
                            {done ? (
                              <Check className="w-4 h-4 text-emerald-400 stroke-[2.75]" />
                            ) : (
                              <span className="font-mono-num font-bold text-base text-white leading-none">
                                {rem}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-right shrink-0">
                      {combo > 1 ? (
                        <>
                          <div className="text-[11px] text-amber-300 font-medium">
                            {t.combo}
                          </div>
                          <div className="font-mono-num font-bold text-lg text-amber-300 leading-tight">
                            {combo}×
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-[11px] text-slate-300 font-medium">
                            {t.score}
                          </div>
                          <div className="font-mono-num font-semibold text-base text-white leading-tight">
                            {score.toLocaleString()}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Classic 8x8 & Board-Clear HUD */
              <div className="w-full max-w-[min(92vw,47dvh)] sm:max-w-[460px] mx-auto grid grid-cols-3 items-center pb-3 sm:pb-4">
                <div className="flex items-center gap-1.5">
                  <Crown className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />
                  <span className="font-mono-num font-bold text-base sm:text-lg text-amber-300">
                    {(mode === 'boardclear'
                      ? highScores.boardclear
                      : highScores.blockblast
                    ).toLocaleString()}
                  </span>
                </div>

                <div className="relative flex items-center justify-center py-1">
                  {combo >= 2 && (
                    <svg
                      viewBox="0 0 64 58"
                      aria-hidden="true"
                      className="pointer-events-none absolute left-1/2 top-1/2 w-16 h-14 sm:w-20 sm:h-18 animate-combo-heart drop-shadow-[0_0_16px_rgba(236,72,153,0.85)]"
                    >
                      <defs>
                        <linearGradient
                          id="comboHeartGrad"
                          x1="0%"
                          y1="0%"
                          x2="0%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#f472b6" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M32 54 C32 54 6 37 6 19 C6 9.5 13.5 3 22 3 C27.2 3 30.5 6 32 9.2 C33.5 6 36.8 3 42 3 C50.5 3 58 9.5 58 19 C58 37 32 54 32 54 Z"
                        fill="url(#comboHeartGrad)"
                        stroke="#fbcfe8"
                        strokeWidth="2.2"
                      />
                    </svg>
                  )}
                  <span className="relative z-10 font-mono-num font-extrabold text-3xl sm:text-4xl text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                    {score.toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-col items-end justify-center text-right">
                  {mode === 'boardclear' ? (
                    <div className="inline-flex items-center gap-1.5 text-purple-200">
                      <Sparkles className="w-4 h-4 text-purple-300 shrink-0" />
                      <span className="font-mono-num font-bold text-base sm:text-lg text-white">
                        {remainingBlocksCount}
                      </span>
                      <span className="text-[11px] text-slate-300 hidden sm:inline">
                        {t.blocksLeftLabel}
                      </span>
                    </div>
                  ) : combo >= 2 ? (
                    <span className="font-display font-extrabold text-sm sm:text-base text-amber-300">
                      {t.combo} {combo}×
                    </span>
                  ) : (
                    <span className="font-mono-num text-xs sm:text-sm text-slate-300">
                      {t.lines}: {linesCleared}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Game Board */}
            <GameBoard
              boardRef={boardRef}
              grid={grid}
              clearingCells={clearingCells}
              recentlyPlacedCells={recentlyPlacedCells}
              lineBlasts={lineBlasts}
              boardShakeKey={boardShakeKey}
              allClearWave={allClearWave}
              gameOverFillRow={gameOverFillRow}
              dragHoverRow={dragState?.hoverRow ?? null}
              dragHoverCol={dragState?.hoverCol ?? null}
              dragShape={dragState?.shape ?? null}
              dragValid={dragState?.isValidDrop ?? false}
              dragPreview={dragState?.preview ?? null}
              selectedShape={selectedPieceObj?.shape ?? null}
              popups={popups}
              onCellClickPlace={(r, c) => {
                if (selectedPieceObj) {
                  commitPiecePlacement(selectedPieceObj.uid, r, c);
                }
              }}
            />

            {/* Selected Piece Hint */}
            <div className="h-5 flex items-center justify-center mt-1">
              {selectedPieceObj && !noSpaceBanner && (
                <span className="text-xs text-sky-300 font-medium">
                  {t.selectedHint}
                </span>
              )}
            </div>

            {/* 3-Slot Piece Dock OR "No Space Left" Banner */}
            {noSpaceBanner ? (
              <div className="w-full max-w-[min(92vw,47dvh)] sm:max-w-[460px] mx-auto h-[82px] sm:h-[108px] mt-1.5 flex items-center justify-center rounded-xl bg-[#131B2E]/90 border border-white/15">
                <span className="font-display font-bold text-lg sm:text-xl text-white tracking-wide">
                  {t.noMovesLeft}
                </span>
              </div>
            ) : (
              <PieceDock
                dock={dock}
                grid={grid}
                activeDragUid={dragState?.pieceUid ?? null}
                selectedUid={selectedUid}
                dealKey={dealKey}
                onStartDrag={handleStartDrag}
                onSelectPiece={(uid) => {
                  soundEngine.playPickup();
                  setSelectedUid((prev) => (prev === uid ? null : uid));
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Floating Dragged Piece */}
      {dragState && (
        <div
          className="fixed z-40 pointer-events-none"
          style={{
            left: dragState.pointerX,
            top: dragState.isTouch
              ? dragState.pointerY - TOUCH_DRAG_LIFT_PX
              : dragState.pointerY,
            transform: 'translate(-50%, -50%) scale(1.03)',
          }}
        >
          <PieceMatrix
            matrix={dragState.shape.matrix}
            color={dragState.shape.color}
            gems={dragState.shape.gems}
            cellSizePx={Math.round(boardCellSize)}
            gapPx={4}
          />
        </div>
      )}

      {/* 1x Free Rescue ("2. Chance") Modal */}
      {rescuePromptOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rescue-modal-title"
        >
          <div className="w-full max-w-sm rounded-2xl bg-[#131A2B] border border-sky-400/50 p-6 shadow-2xl text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-sky-500/15 border border-sky-400/45 flex items-center justify-center mb-4">
              <HeartHandshake className="w-7 h-7 text-sky-300" />
            </div>

            <h2
              id="rescue-modal-title"
              className="font-display font-extrabold text-2xl text-white mb-2"
            >
              {t.rescueTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
              {t.rescueSubtitle}
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleAcceptRescue}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-extrabold text-base transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t.rescueAccept}</span>
              </button>
              <button
                type="button"
                onClick={triggerGameOverSequence}
                className="w-full px-5 py-2.5 rounded-xl bg-transparent hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 font-medium text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t.rescueSkip}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <RulesModal
        open={rulesOpen}
        language={language}
        onClose={() => setRulesOpen(false)}
      />

      <PrivacyModal
        open={privacyOpen}
        language={language}
        storageEnabled={storageEnabled}
        onToggleStorage={handleToggleStorageConsent}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onClearAllData={handleClearAllData}
        onClose={() => setPrivacyOpen(false)}
      />

      <LevelCompleteModal
        open={gameState === 'LEVEL_COMPLETE'}
        mode={mode}
        level={
          mode === 'boardclear'
            ? (currentBoardClearDef?.stage ?? boardClearStage)
            : (currentAdventureLevel?.level ?? selectedAdventureLevel)
        }
        stageTitle={currentStageTitle}
        score={score}
        consecutiveVictories={consecutiveVictories}
        language={language}
        onNextLevel={() => {
          if (mode === 'boardclear') {
            const nextStg = (currentBoardClearDef?.stage ?? boardClearStage) + 1;
            startBoardClearStage(nextStg, true);
          } else {
            const nextLvl = Math.min(
              TOTAL_ADVENTURE_LEVELS,
              (currentAdventureLevel?.level ?? selectedAdventureLevel) + 1,
            );
            startAdventureLevel(nextLvl);
          }
        }}
        onSecondaryAction={() =>
          setGameState(mode === 'adventure' ? 'ADVENTURE_MAP' : 'TITLE_MENU')
        }
      />

      <GameOverModal
        open={gameState === 'GAME_OVER'}
        mode={mode}
        adventureLevel={currentAdventureLevel?.level ?? selectedAdventureLevel}
        boardClearStage={currentBoardClearDef?.stage ?? boardClearStage}
        score={score}
        highScore={
          mode === 'blocksturz'
            ? highScores.blocksturz
            : mode === 'boardclear'
              ? highScores.boardclear
              : highScores.blockblast
        }
        isNewRecord={isNewRecord}
        linesCleared={linesCleared}
        bestStreak={bestCombo}
        language={language}
        onPlayAgain={() => {
          if (mode === 'adventure' && currentAdventureLevel) {
            startAdventureLevel(currentAdventureLevel.level);
          } else if (mode === 'boardclear' && currentBoardClearDef) {
            startBoardClearStage(currentBoardClearDef.stage, false);
          } else {
            startFreshGame(mode);
          }
        }}
        onChangeMode={() => setGameState('TITLE_MENU')}
        onOpenAdventureMap={() => setGameState('ADVENTURE_MAP')}
      />
    </div>
  );
}
