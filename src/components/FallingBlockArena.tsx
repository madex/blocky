import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronsDown,
  Pause,
  Play,
  RotateCw,
} from 'lucide-react';
import { COLOR_PALETTE } from '../data/pieces';
import type { ColorId, Language, ScorePopup } from '../types/game';
import { COPY } from '../utils/i18n';
import { soundEngine } from '../utils/sound';
import { BlockTile, PieceMatrix } from './BlockTile';

const COLS = 10;
const ROWS = 16;

interface FallingTemplate {
  id: string;
  matrix: number[][];
  color: ColorId;
}

const FALLING_TEMPLATES: FallingTemplate[] = [
  { id: 'I', matrix: [[1, 1, 1, 1]], color: 'cyan' },
  {
    id: 'O',
    matrix: [
      [1, 1],
      [1, 1],
    ],
    color: 'amber',
  },
  {
    id: 'T',
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: 'indigo',
  },
  {
    id: 'L',
    matrix: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: 'coral',
  },
  {
    id: 'J',
    matrix: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: 'cobalt',
  },
  {
    id: 'S',
    matrix: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: 'emerald',
  },
  {
    id: 'Z',
    matrix: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: 'rose',
  },
];

interface ActivePiece {
  matrix: number[][];
  color: ColorId;
  row: number;
  col: number;
}

type FallingGrid = (ColorId | null)[][];

function createEmptyBoard(): FallingGrid {
  return Array.from({ length: ROWS }, () => Array<ColorId | null>(COLS).fill(null));
}

function randomTemplate(): FallingTemplate {
  return FALLING_TEMPLATES[Math.floor(Math.random() * FALLING_TEMPLATES.length)];
}

function rotateMatrixCW(matrix: number[][]): number[][] {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const res: number[][] = Array.from({ length: cols }, () =>
    Array<number>(rows).fill(0),
  );
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      res[c][rows - 1 - r] = matrix[r][c];
    }
  }
  return res;
}

function collides(
  board: FallingGrid,
  matrix: number[][],
  row: number,
  col: number,
): boolean {
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[0].length; c++) {
      if (matrix[r][c] !== 1) continue;
      const nr = row + r;
      const nc = col + c;
      if (nc < 0 || nc >= COLS || nr >= ROWS) return true;
      if (nr >= 0 && board[nr][nc] !== null) return true;
    }
  }
  return false;
}

function createSpawnPiece(template: FallingTemplate): ActivePiece {
  const col = Math.floor((COLS - template.matrix[0].length) / 2);
  return {
    matrix: template.matrix.map((r) => [...r]),
    color: template.color,
    row: 0,
    col,
  };
}

function computeDropIntervalMs(elapsedSeconds: number, currentScore: number): number {
  const timeReduction = Math.min(430, elapsedSeconds * 3.0);
  const scoreReduction = Math.min(300, Math.floor(currentScore / 100) * 14);
  return Math.max(120, Math.round(850 - timeReduction - scoreReduction));
}

interface FallingBlockArenaProps {
  language: Language;
  highScore: number;
  resetToken: number;
  isGameOver: boolean;
  onScoreChange: (
    nextScore: number,
    nextLines: number,
    nextBestStreak: number,
  ) => void;
  onGameOver: (finalScore: number, totalLines: number, bestStreak: number) => void;
}

export const FallingBlockArena: React.FC<FallingBlockArenaProps> = ({
  language,
  highScore,
  resetToken,
  isGameOver,
  onScoreChange,
  onGameOver,
}) => {
  const t = COPY[language];

  const [board, setBoard] = useState<FallingGrid>(createEmptyBoard);
  const [active, setActive] = useState<ActivePiece>(() =>
    createSpawnPiece(randomTemplate()),
  );
  const [nextTemplate, setNextTemplate] = useState<FallingTemplate>(() =>
    randomTemplate(),
  );
  const [score, setScore] = useState(0);
  const [linesCleared, setLinesCleared] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [paused, setPaused] = useState(false);
  const [clearingRows, setClearingRows] = useState<Set<number>>(new Set());
  const [popups, setPopups] = useState<ScorePopup[]>([]);

  const isClearingRef = useRef(false);
  const clearTimerRef = useRef<number | null>(null);
  const gestureRef = useRef<{
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    moved: boolean;
    dropped: boolean;
    startTime: number;
  } | null>(null);

  // Refs for stable interval callbacks
  const stateRef = useRef({
    board,
    active,
    nextTemplate,
    score,
    linesCleared,
    streak,
    bestStreak,
    paused,
    isGameOver,
  });
  stateRef.current = {
    board,
    active,
    nextTemplate,
    score,
    linesCleared,
    streak,
    bestStreak,
    paused,
    isGameOver,
  };

  const onScoreChangeRef = useRef(onScoreChange);
  onScoreChangeRef.current = onScoreChange;

  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  // Reset entire arena ONLY when resetToken changes
  useEffect(() => {
    if (clearTimerRef.current) {
      window.clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }
    isClearingRef.current = false;

    const freshBoard = createEmptyBoard();
    const first = randomTemplate();
    const upcoming = randomTemplate();

    setBoard(freshBoard);
    setActive(createSpawnPiece(first));
    setNextTemplate(upcoming);
    setScore(0);
    setLinesCleared(0);
    setStreak(0);
    setBestStreak(0);
    setElapsedSec(0);
    setPaused(false);
    setClearingRows(new Set());
    setPopups([]);
    onScoreChangeRef.current(0, 0, 0);
  }, [resetToken]);

  useEffect(() => {
    return () => {
      if (clearTimerRef.current) window.clearTimeout(clearTimerRef.current);
    };
  }, []);

  // Active elapsed time counter for continuous speed escalation
  useEffect(() => {
    if (paused || isGameOver) return;
    const timer = window.setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [paused, isGameOver]);

  const spawnPopup = useCallback(
    (points: number, row: number, col: number, label?: string) => {
      const id = `fpop_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      setPopups((prev) => [...prev, { id, points, row, col, label }]);
      window.setTimeout(() => {
        setPopups((prev) => prev.filter((p) => p.id !== id));
      }, 950);
    },
    [],
  );

  const lockPieceAndAdvance = useCallback(
    (pieceToLock: ActivePiece, dropBonusPoints = 0) => {
      if (isClearingRef.current) return;
      const {
        board: curBoard,
        nextTemplate: curNext,
        score: curScore,
        linesCleared: curLines,
        streak: curStreak,
        bestStreak: curBestStreak,
      } = stateRef.current;

      const merged = curBoard.map((r) => [...r]);
      for (let r = 0; r < pieceToLock.matrix.length; r++) {
        for (let c = 0; c < pieceToLock.matrix[0].length; c++) {
          if (pieceToLock.matrix[r][c] === 1) {
            const br = pieceToLock.row + r;
            const bc = pieceToLock.col + c;
            if (br >= 0 && br < ROWS && bc >= 0 && bc < COLS) {
              merged[br][bc] = pieceToLock.color;
            }
          }
        }
      }

      // Detect completed rows
      const fullRowIndices: number[] = [];
      for (let r = 0; r < ROWS; r++) {
        if (merged[r].every((cell) => cell !== null)) {
          fullRowIndices.push(r);
        }
      }

      const spawnNextPiece = (
        settledBoard: FallingGrid,
        updatedScore: number,
        updatedLines: number,
        updatedBestStreak: number,
      ) => {
        const candidate = createSpawnPiece(curNext);
        const following = randomTemplate();

        if (collides(settledBoard, candidate.matrix, candidate.row, candidate.col)) {
          setBoard(settledBoard);
          soundEngine.playGameOver();
          onGameOverRef.current(updatedScore, updatedLines, updatedBestStreak);
          return;
        }

        setBoard(settledBoard);
        setActive(candidate);
        setNextTemplate(following);
      };

      if (fullRowIndices.length > 0) {
        isClearingRef.current = true;
        const k = fullRowIndices.length;
        const nextStreak = curStreak + 1;
        const nextBestStreak = Math.max(curBestStreak, nextStreak);

        // Escalating points per cleared row + multi-row simultaneous bonus
        let rowBaseTotal = 0;
        for (let i = 0; i < k; i++) {
          rowBaseTotal += 100 + (curLines + i) * 20;
        }
        const multiRowBonus =
          k === 2 ? 150 : k === 3 ? 400 : k >= 4 ? 800 : 0;
        const streakMult = 1 + (nextStreak - 1) * 0.25;
        const clearPoints =
          Math.round(((rowBaseTotal + multiRowBonus) * streakMult) / 5) * 5;

        const totalEarned = clearPoints + dropBonusPoints;
        const nextScore = curScore + totalEarned;
        const nextLines = curLines + k;

        setBoard(merged);
        setClearingRows(new Set(fullRowIndices));
        setScore(nextScore);
        setLinesCleared(nextLines);
        setStreak(nextStreak);
        setBestStreak(nextBestStreak);
        onScoreChangeRef.current(nextScore, nextLines, nextBestStreak);

        const label =
          k >= 4
            ? t.comboMega
            : k === 3
              ? t.comboTriple
              : k === 2
                ? t.comboDouble
                : nextStreak > 1
                  ? `${t.combo} ${nextStreak}×`
                  : t.comboSingle;

        soundEngine.playClear(k, nextStreak);
        spawnPopup(
          totalEarned,
          fullRowIndices[Math.floor(fullRowIndices.length / 2)],
          COLS / 2 - 0.5,
          label,
        );

        clearTimerRef.current = window.setTimeout(() => {
          clearTimerRef.current = null;
          const fullSet = new Set(fullRowIndices);
          const remaining = merged
            .filter((_, idx) => !fullSet.has(idx))
            .map((r) => [...r]);
          while (remaining.length < ROWS) {
            remaining.unshift(Array<ColorId | null>(COLS).fill(null));
          }
          setClearingRows(new Set());
          isClearingRef.current = false;
          spawnNextPiece(remaining, nextScore, nextLines, nextBestStreak);
        }, 180);
      } else {
        const nextScore = curScore + dropBonusPoints + 10;
        setScore(nextScore);
        setStreak(0);
        onScoreChangeRef.current(nextScore, curLines, curBestStreak);
        soundEngine.playPlace();
        spawnNextPiece(merged, nextScore, curLines, curBestStreak);
      }
    },
    [spawnPopup, t],
  );

  const moveHorizontal = useCallback((deltaCol: number) => {
    const { board: b, active: a, paused: p, isGameOver: over } = stateRef.current;
    if (p || over || isClearingRef.current) return;
    if (!collides(b, a.matrix, a.row, a.col + deltaCol)) {
      setActive({ ...a, col: a.col + deltaCol });
      soundEngine.playPickup();
    }
  }, []);

  const rotateActive = useCallback(() => {
    const { board: b, active: a, paused: p, isGameOver: over } = stateRef.current;
    if (p || over || isClearingRef.current) return;
    const rotated = rotateMatrixCW(a.matrix);
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      if (!collides(b, rotated, a.row, a.col + kick)) {
        setActive({ ...a, matrix: rotated, col: a.col + kick });
        soundEngine.playPickup();
        return;
      }
    }
  }, []);

  const stepDown = useCallback(
    (isSoftDrop = false) => {
      const {
        board: b,
        active: a,
        score: curS,
        linesCleared: curL,
        bestStreak: curBS,
        paused: p,
        isGameOver: over,
      } = stateRef.current;
      if (p || over || isClearingRef.current) return;
      if (!collides(b, a.matrix, a.row + 1, a.col)) {
        setActive({ ...a, row: a.row + 1 });
        if (isSoftDrop) {
          const next = curS + 1;
          setScore(next);
          onScoreChangeRef.current(next, curL, curBS);
        }
      } else {
        lockPieceAndAdvance(a, 0);
      }
    },
    [lockPieceAndAdvance],
  );

  const hardDrop = useCallback(() => {
    const { board: b, active: a, paused: p, isGameOver: over } = stateRef.current;
    if (p || over || isClearingRef.current) return;
    let targetRow = a.row;
    while (!collides(b, a.matrix, targetRow + 1, a.col)) {
      targetRow++;
    }
    const distance = targetRow - a.row;
    lockPieceAndAdvance({ ...a, row: targetRow }, distance * 2);
  }, [lockPieceAndAdvance]);

  // Dynamic gravity loop whose interval shrinks steadily with elapsed time & score
  const dropIntervalMs = computeDropIntervalMs(elapsedSec, score);
  const speedMultiplier = (850 / dropIntervalMs).toFixed(1);

  useEffect(() => {
    if (paused || isGameOver) return;
    const timer = window.setInterval(() => {
      stepDown(false);
    }, dropIntervalMs);
    return () => window.clearInterval(timer);
  }, [dropIntervalMs, isGameOver, paused, stepDown]);

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (stateRef.current.isGameOver) return;
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        e.preventDefault();
        moveHorizontal(-1);
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        e.preventDefault();
        moveHorizontal(1);
      } else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        e.preventDefault();
        rotateActive();
      } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
        e.preventDefault();
        stepDown(true);
      } else if (e.key === ' ') {
        e.preventDefault();
        hardDrop();
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setPaused((prev) => !prev);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hardDrop, moveHorizontal, rotateActive, stepDown]);

  // Compute ghost landing row
  let ghostRow = active.row;
  while (!collides(board, active.matrix, ghostRow + 1, active.col)) {
    ghostRow++;
  }

  // Build lookup sets for active and ghost cells using reactive clearingRows state
  const isClearingNow = clearingRows.size > 0;
  const activeCellMap = new Map<string, ColorId>();
  const ghostCellSet = new Set<string>();

  if (!isClearingNow) {
    for (let r = 0; r < active.matrix.length; r++) {
      for (let c = 0; c < active.matrix[0].length; c++) {
        if (active.matrix[r][c] === 1) {
          ghostCellSet.add(`${ghostRow + r},${active.col + c}`);
          activeCellMap.set(
            `${active.row + r},${active.col + c}`,
            active.color,
          );
        }
      }
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      {/* Compact Unboxed HUD */}
      <div className="w-full max-w-[360px] flex items-end justify-between gap-3 pb-3">
        <div>
          <div className="text-xs text-slate-400 font-medium">{t.score}</div>
          <div className="font-mono-num font-bold text-3xl text-white leading-none mt-1">
            {score.toLocaleString()}
          </div>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <div className="text-xs text-amber-400/90 font-medium">
              {t.speed}
            </div>
            <div className="font-mono-num font-bold text-lg text-amber-300 leading-tight">
              {speedMultiplier}×
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">{t.lines}</div>
            <div className="font-mono-num font-semibold text-lg text-slate-200 leading-tight">
              {linesCleared}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">{t.best}</div>
            <div className="font-mono-num font-semibold text-lg text-slate-200 leading-tight">
              {Math.max(highScore, score).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Board + Side Mini Preview Row */}
      <div className="w-full flex items-start justify-center gap-2.5 sm:gap-3">
        <div
          onPointerDown={(e) => {
            if (paused || isGameOver || isClearingRef.current) return;
            gestureRef.current = {
              startX: e.clientX,
              startY: e.clientY,
              lastX: e.clientX,
              lastY: e.clientY,
              moved: false,
              dropped: false,
              startTime: Date.now(),
            };
          }}
          onPointerMove={(e) => {
            const g = gestureRef.current;
            if (!g || paused || isGameOver || g.dropped) return;
            const dx = e.clientX - g.lastX;
            const dy = e.clientY - g.lastY;

            if (Math.abs(e.clientX - g.startX) > 10 || Math.abs(e.clientY - g.startY) > 10) {
              g.moved = true;
            }

            if (Math.abs(dx) >= 24) {
              moveHorizontal(dx > 0 ? 1 : -1);
              g.lastX = e.clientX;
            } else if (dy >= 28) {
              if (e.clientY - g.startY >= 64 && Date.now() - g.startTime < 260) {
                hardDrop();
                g.dropped = true;
              } else {
                stepDown(true);
                g.lastY = e.clientY;
              }
            }
          }}
          onPointerUp={() => {
            const g = gestureRef.current;
            if (g && !g.moved && !g.dropped && !paused && !isGameOver) {
              rotateActive();
            }
            gestureRef.current = null;
          }}
          onPointerCancel={() => {
            gestureRef.current = null;
          }}
          className="relative w-full max-w-[min(64vw,33dvh)] sm:max-w-[300px] aspect-[10/16] rounded-xl bg-[#131A2B] p-1.5 sm:p-2 border border-slate-700/60 shadow-2xl shadow-black/50 touch-none"
        >
          <div
            className="w-full h-full grid gap-[2px]"
            style={{
              gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
            }}
          >
            {board.map((row, r) =>
              row.map((cell, c) => {
                const key = `${r},${c}`;
                const activeColor = activeCellMap.get(key);
                const isGhost = !activeColor && ghostCellSet.has(key);
                const isClearing = clearingRows.has(r);
                const displayColor = activeColor ?? cell;

                return (
                  <div
                    key={key}
                    className={`relative w-full h-full rounded-[4px] ${
                      displayColor === null
                        ? 'bg-[#172035] border border-slate-800/70'
                        : ''
                    }`}
                  >
                    {displayColor !== null && (
                      <BlockTile color={displayColor} isClearing={isClearing} />
                    )}

                    {displayColor === null && isGhost && (
                      <div
                        className={`w-full h-full rounded-[4px] border ${COLOR_PALETTE[active.color].ghost}`}
                      />
                    )}
                  </div>
                );
              }),
            )}
          </div>

          {/* Horizontal Laser Glow on Clearing Rows */}
          {isClearingNow && (
            <div className="pointer-events-none absolute inset-1.5 sm:inset-2 z-10 overflow-hidden rounded-lg">
              {Array.from(clearingRows).map((rIdx) => (
                <div
                  key={`laser_row_${rIdx}`}
                  style={{
                    top: `${(rIdx / ROWS) * 100}%`,
                    height: `${100 / ROWS}%`,
                  }}
                  className="absolute left-0 right-0 bg-gradient-to-r from-sky-300/80 via-white to-sky-300/80 shadow-[0_0_16px_rgba(255,255,255,0.9)] animate-line-laser"
                />
              ))}
            </div>
          )}

          {/* Pause Overlay */}
          {paused && !isGameOver && (
            <div className="absolute inset-0 rounded-xl bg-[#0C111D]/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-20">
              <div className="font-display font-bold text-xl text-white">
                {t.pausedLabel}
              </div>
              <button
                type="button"
                onClick={() => setPaused(false)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-display font-bold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{t.resume}</span>
              </button>
            </div>
          )}

          {/* Floating Score Popups */}
          <div className="pointer-events-none absolute inset-0 overflow-visible z-20">
            {popups.map((popup) => {
              const leftPct = ((popup.col + 0.5) / COLS) * 100;
              const topPct = ((popup.row + 0.5) / ROWS) * 100;
              return (
                <div
                  key={popup.id}
                  style={{
                    left: `${leftPct}%`,
                    top: `${Math.min(Math.max(topPct, 16), 84)}%`,
                  }}
                  className="absolute animate-score-float text-center whitespace-nowrap"
                >
                  <div className="font-display font-bold text-xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                    +{popup.points}
                  </div>
                  {popup.label && (
                    <div className="font-display font-semibold text-xs text-amber-300 tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                      {popup.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Piece + Pause Column */}
        <div className="flex flex-col gap-2.5 sm:gap-3 w-[74px] sm:w-[84px] shrink-0">
          <div className="rounded-xl bg-[#131A2B] border border-slate-700/60 p-3 flex flex-col items-center">
            <div className="text-[11px] font-medium text-slate-400 mb-2.5">
              {t.nextPiece}
            </div>
            <div className="h-12 flex items-center justify-center">
              <PieceMatrix
                matrix={nextTemplate.matrix}
                color={nextTemplate.color}
                cellSizePx={14}
                gapPx={2}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#131A2B] hover:bg-[#19233A] border border-slate-700/60 text-xs font-medium text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {paused ? (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>{t.resume}</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>{t.pause}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Touch & Click Controls */}
      <div className="w-full max-w-[360px] grid grid-cols-5 gap-2 mt-3">
        <button
          type="button"
          onClick={() => moveHorizontal(-1)}
          aria-label="Links"
          className="h-12 rounded-xl bg-[#131A2B] hover:bg-[#1A243B] active:scale-95 border border-slate-700/60 flex items-center justify-center text-slate-100 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={rotateActive}
          aria-label={t.rotate}
          className="h-12 rounded-xl bg-[#131A2B] hover:bg-[#1A243B] active:scale-95 border border-slate-700/60 flex items-center justify-center text-slate-100 transition-all cursor-pointer"
        >
          <RotateCw className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => stepDown(true)}
          aria-label="Runter"
          className="h-12 rounded-xl bg-[#131A2B] hover:bg-[#1A243B] active:scale-95 border border-slate-700/60 flex items-center justify-center text-slate-100 transition-all cursor-pointer"
        >
          <ArrowDown className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={hardDrop}
          aria-label={t.drop}
          className="h-12 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 active:scale-95 border border-sky-400/50 flex items-center justify-center text-sky-200 transition-all cursor-pointer"
        >
          <ChevronsDown className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => moveHorizontal(1)}
          aria-label="Rechts"
          className="h-12 rounded-xl bg-[#131A2B] hover:bg-[#1A243B] active:scale-95 border border-slate-700/60 flex items-center justify-center text-slate-100 transition-all cursor-pointer"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
