import React, { useState } from 'react';
import { COLOR_PALETTE } from '../data/pieces';
import type {
  ClearPreview,
  ColorId,
  GemType,
  Grid,
  LineBlastEffect,
  PieceShape,
  ScorePopup,
} from '../types/game';
import { canPlacePiece, getPreviewClears } from '../utils/gameLogic';
import { BlockTile, GemIcon } from './BlockTile';

const RAINBOW_ROW_COLORS: ColorId[] = [
  'rose',
  'coral',
  'gold',
  'emerald',
  'cyan',
  'cobalt',
  'indigo',
  'purple',
];

const SHARD_OFFSETS = [
  { pos: 8, tx: -18, ty: -22, rot: -110 },
  { pos: 20, tx: 14, ty: -26, rot: 95 },
  { pos: 33, tx: -12, ty: 24, rot: -140 },
  { pos: 46, tx: 20, ty: -18, rot: 130 },
  { pos: 58, tx: -16, ty: 22, rot: -85 },
  { pos: 71, tx: 15, ty: 25, rot: 120 },
  { pos: 83, tx: -14, ty: -24, rot: -125 },
  { pos: 93, tx: 18, ty: 19, rot: 105 },
];

interface GameBoardProps {
  boardRef: React.RefObject<HTMLDivElement | null>;
  grid: Grid;
  clearingCells: Set<string>;
  recentlyPlacedCells: Set<string>;
  lineBlasts: LineBlastEffect[];
  boardShakeKey: number;
  allClearWave: boolean;
  gameOverFillRow: number | null;
  dragHoverRow: number | null;
  dragHoverCol: number | null;
  dragShape: PieceShape | null;
  dragValid: boolean;
  dragPreview: ClearPreview | null;
  selectedShape: PieceShape | null;
  popups: ScorePopup[];
  onCellClickPlace: (row: number, col: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  boardRef,
  grid,
  clearingCells,
  recentlyPlacedCells,
  lineBlasts,
  boardShakeKey,
  allClearWave,
  gameOverFillRow,
  dragHoverRow,
  dragHoverCol,
  dragShape,
  dragValid,
  dragPreview,
  selectedShape,
  popups,
  onCellClickPlace,
}) => {
  const size = grid.length;
  const [tapHoverCell, setTapHoverCell] = useState<{
    r: number;
    c: number;
  } | null>(null);

  const activeShape = dragShape ?? selectedShape;
  const activeAnchor = dragShape
    ? dragHoverRow !== null && dragHoverCol !== null
      ? { r: dragHoverRow, c: dragHoverCol }
      : null
    : selectedShape && tapHoverCell
      ? {
          r: Math.min(
            Math.max(
              0,
              tapHoverCell.r - Math.floor(selectedShape.matrix.length / 2),
            ),
            size - selectedShape.matrix.length,
          ),
          c: Math.min(
            Math.max(
              0,
              tapHoverCell.c - Math.floor(selectedShape.matrix[0].length / 2),
            ),
            size - selectedShape.matrix[0].length,
          ),
        }
      : null;

  const isTapValid =
    !dragShape && selectedShape && activeAnchor
      ? canPlacePiece(grid, selectedShape.matrix, activeAnchor.r, activeAnchor.c)
      : false;

  const tapPreview =
    !dragShape && selectedShape && activeAnchor && isTapValid
      ? getPreviewClears(grid, selectedShape, activeAnchor.r, activeAnchor.c)
      : null;

  const effectiveValid = dragShape ? dragValid : isTapValid;
  const effectivePreview = dragShape ? dragPreview : tapPreview;

  const ghostGemMap = new Map<string, GemType>();
  const ghostCells = new Set<string>();
  if (activeShape && activeAnchor) {
    for (let pr = 0; pr < activeShape.matrix.length; pr++) {
      for (let pc = 0; pc < activeShape.matrix[0].length; pc++) {
        if (activeShape.matrix[pr][pc] === 1) {
          const gr = activeAnchor.r + pr;
          const gc = activeAnchor.c + pc;
          if (gr >= 0 && gr < size && gc >= 0 && gc < size) {
            const key = `${gr},${gc}`;
            ghostCells.add(key);
            const g = activeShape.gems?.[pr]?.[pc] ?? null;
            if (g) {
              ghostGemMap.set(key, g);
            }
          }
        }
      }
    }
  }

  return (
    <div
      key={boardShakeKey > 0 ? `shake_${boardShakeKey}` : 'board_static'}
      className={`relative w-full max-w-[min(92vw,47dvh)] sm:max-w-[460px] aspect-square mx-auto select-none touch-none ${
        boardShakeKey > 0 ? 'animate-board-shake' : ''
      }`}
    >
      <div
        ref={boardRef}
        onMouseLeave={() => setTapHoverCell(null)}
        className="relative w-full h-full rounded-xl bg-[#131B2E] p-2 sm:p-2.5 border border-slate-700/70 shadow-2xl shadow-black/55"
      >
        <div
          className="relative w-full h-full grid gap-[3px] sm:gap-1"
          style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const key = `${r},${c}`;
              const isGhost = ghostCells.has(key);
              const ghostGem = ghostGemMap.get(key) ?? null;
              const isClearTarget =
                effectivePreview?.clearedCells.has(key) ?? false;
              const isClearingNow = clearingCells.has(key);
              const isPlacedAnim = recentlyPlacedCells.has(key);
              const isGameOverFilled =
                gameOverFillRow !== null && r >= gameOverFillRow && cell === null;

              const ghostPalette = activeShape
                ? COLOR_PALETTE[
                    (ghostGem ? 'stone' : activeShape.color) as ColorId
                  ]
                : null;

              return (
                <button
                  key={key}
                  type="button"
                  aria-label={`Row ${r + 1} Column ${c + 1}`}
                  onMouseEnter={() => {
                    if (selectedShape && !dragShape) {
                      setTapHoverCell({ r, c });
                    }
                  }}
                  onClick={() => {
                    if (selectedShape && !dragShape) {
                      const anchorR = Math.min(
                        Math.max(
                          0,
                          r - Math.floor(selectedShape.matrix.length / 2),
                        ),
                        size - selectedShape.matrix.length,
                      );
                      const anchorC = Math.min(
                        Math.max(
                          0,
                          c - Math.floor(selectedShape.matrix[0].length / 2),
                        ),
                        size - selectedShape.matrix[0].length,
                      );
                      onCellClickPlace(anchorR, anchorC);
                      setTapHoverCell(null);
                    }
                  }}
                  className={`relative w-full h-full rounded-[5px] transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                    cell === null ? 'bg-[#19233C]' : ''
                  } ${
                    cell === null && !isGhost
                      ? 'border border-slate-800/85'
                      : ''
                  } ${selectedShape ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  {cell !== null && (
                    <BlockTile
                      color={cell.color}
                      gem={cell.gem}
                      previewColor={
                        effectiveValid && isClearTarget && activeShape
                          ? activeShape.color
                          : undefined
                      }
                      isClearing={isClearingNow}
                      isClearPreview={effectiveValid && isClearTarget}
                      isPlacedAnim={isPlacedAnim}
                    />
                  )}

                  {isGameOverFilled && (
                    <BlockTile
                      color={RAINBOW_ROW_COLORS[(r + c) % RAINBOW_ROW_COLORS.length]}
                      isPlacedAnim
                    />
                  )}

                  {cell === null && !isGameOverFilled && isGhost && ghostPalette && (
                    <div
                      className={`w-full h-full rounded-[5px] border flex items-center justify-center transition-all duration-75 ${
                        effectiveValid
                          ? isClearTarget && activeShape && !ghostGem
                            ? 'opacity-90 ring-2 ring-white/85'
                            : `${ghostPalette.ghost}`
                          : 'bg-rose-500/20 border-rose-400/50'
                      }`}
                    >
                      {effectiveValid && isClearTarget && activeShape && !ghostGem ? (
                        <BlockTile color={activeShape.color} isClearPreview />
                      ) : effectiveValid && ghostGem ? (
                        <GemIcon
                          gem={ghostGem}
                          className="w-[64%] h-[64%] opacity-80"
                        />
                      ) : null}
                    </div>
                  )}

                  {cell === null && !isGhost && isClearTarget && effectiveValid && (
                    <div className="absolute inset-0 rounded-[5px] bg-white/15 ring-1 ring-white/45 pointer-events-none" />
                  )}

                  {/* All-Clear Rainbow Wave Celebration (+300 Unbelievable!) */}
                  {allClearWave && (
                    <div
                      style={{
                        animationDelay: `${(size - 1 - r) * 35 + c * 14}ms`,
                      }}
                      className="pointer-events-none absolute inset-0 z-20 animate-rainbow-wave"
                    >
                      <BlockTile
                        color={
                          RAINBOW_ROW_COLORS[
                            (size - 1 - r + c) % RAINBOW_ROW_COLORS.length
                          ]
                        }
                      />
                    </div>
                  )}
                </button>
              );
            }),
          )}
        </div>

        {/* Laser-Beam Line Flashes & Flying Square Shards */}
        <div className="pointer-events-none absolute inset-2 sm:inset-2.5 overflow-visible z-25">
          {lineBlasts.map((blast) => {
            const hex = COLOR_PALETTE[blast.color]?.hex ?? '#38bdf8';
            return (
              <React.Fragment key={blast.id}>
                {blast.rows.map((rIdx) => (
                  <div
                    key={`${blast.id}_r_${rIdx}`}
                    style={{
                      top: `${(rIdx / size) * 100}%`,
                      height: `${100 / size}%`,
                    }}
                    className="absolute left-0 right-0"
                  >
                    <div
                      style={{
                        background: `linear-gradient(90deg, transparent 0%, ${hex}cc 12%, #ffffff 50%, ${hex}cc 88%, transparent 100%)`,
                        boxShadow: `0 0 22px 6px ${hex}99`,
                      }}
                      className="w-full h-full rounded-lg animate-line-beam-h"
                    />
                    {SHARD_OFFSETS.map((sh, sIdx) => (
                      <span
                        key={sIdx}
                        style={
                          {
                            left: `${sh.pos}%`,
                            top: '50%',
                            backgroundColor: sIdx % 2 === 0 ? '#ffffff' : hex,
                            boxShadow: `0 0 8px ${hex}`,
                            '--tx': `${sh.tx}px`,
                            '--ty': `${sh.ty}px`,
                            '--rot': `${sh.rot}deg`,
                          } as React.CSSProperties
                        }
                        className="absolute w-2.5 h-2.5 rounded-[2px] animate-particle-burst"
                      />
                    ))}
                  </div>
                ))}

                {blast.cols.map((cIdx) => (
                  <div
                    key={`${blast.id}_c_${cIdx}`}
                    style={{
                      left: `${(cIdx / size) * 100}%`,
                      width: `${100 / size}%`,
                    }}
                    className="absolute top-0 bottom-0"
                  >
                    <div
                      style={{
                        background: `linear-gradient(180deg, transparent 0%, ${hex}cc 12%, #ffffff 50%, ${hex}cc 88%, transparent 100%)`,
                        boxShadow: `0 0 22px 6px ${hex}99`,
                      }}
                      className="w-full h-full rounded-lg animate-line-beam-v"
                    />
                    {SHARD_OFFSETS.map((sh, sIdx) => (
                      <span
                        key={sIdx}
                        style={
                          {
                            top: `${sh.pos}%`,
                            left: '50%',
                            backgroundColor: sIdx % 2 === 0 ? '#ffffff' : hex,
                            boxShadow: `0 0 8px ${hex}`,
                            '--tx': `${sh.ty}px`,
                            '--ty': `${sh.tx}px`,
                            '--rot': `${sh.rot}deg`,
                          } as React.CSSProperties
                        }
                        className="absolute w-2.5 h-2.5 rounded-[2px] animate-particle-burst"
                      />
                    ))}
                  </div>
                ))}
              </React.Fragment>
            );
          })}
        </div>

        {/* Floating Score Popups, Combo Banners & Praise Callouts */}
        <div className="pointer-events-none absolute inset-0 overflow-visible z-30">
          {popups.map((popup) => {
            const leftPct = popup.isAllClear
              ? 50
              : ((popup.col + 0.5) / size) * 100;
            const topPct = popup.isAllClear
              ? 46
              : ((popup.row + 0.5) / size) * 100;
            return (
              <div
                key={popup.id}
                style={{
                  left: `${Math.min(Math.max(leftPct, 20), 80)}%`,
                  top: `${Math.min(Math.max(topPct, 18), 82)}%`,
                }}
                className="absolute animate-score-float text-center whitespace-nowrap"
              >
                {popup.comboCount !== undefined && popup.comboCount >= 1 && (
                  <div className="font-display font-black italic text-base sm:text-xl text-sky-300 tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                    Combo{' '}
                    {popup.comboCount > 1 && (
                      <span className="text-amber-300 text-xl sm:text-2xl not-italic">
                        {popup.comboCount}
                      </span>
                    )}
                  </div>
                )}

                <div
                  className={`font-mono-num font-extrabold ${
                    popup.isAllClear
                      ? 'text-3xl sm:text-4xl text-white'
                      : 'text-xl sm:text-2xl text-amber-200'
                  } drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]`}
                >
                  +{popup.points}
                </div>

                {popup.praise && (
                  <div
                    className={`font-display font-extrabold tracking-wide drop-shadow-[0_3px_10px_rgba(0,0,0,0.95)] ${
                      popup.isAllClear
                        ? 'text-xl sm:text-2xl text-emerald-300'
                        : 'text-base sm:text-lg text-amber-300'
                    }`}
                  >
                    ✦ {popup.praise} ✦
                  </div>
                )}

                {popup.label && !popup.comboCount && (
                  <div className="font-display font-semibold text-xs sm:text-sm text-sky-300 tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                    {popup.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
