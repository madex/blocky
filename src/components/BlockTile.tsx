import React from 'react';
import { COLOR_PALETTE } from '../data/pieces';
import type { ColorId, GemType } from '../types/game';

interface GemIconProps {
  gem: GemType;
  className?: string;
}

export const GemIcon: React.FC<GemIconProps> = ({
  gem,
  className = 'w-[68%] h-[68%]',
}) => {
  switch (gem) {
    case 'diamond_blue':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
          <polygon
            points="8,6 24,6 29,13 16,27 3,13"
            fill="#0EA5E9"
            stroke="#0369A1"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <polygon points="8,6 24,6 20,13 12,13" fill="#7DD3FC" />
          <polygon points="12,13 20,13 16,27" fill="#38BDF8" />
          <polygon points="3,13 12,13 16,27" fill="#0284C7" />
        </svg>
      );
    case 'emerald_green':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
          <polygon
            points="10,4 22,4 28,10 28,22 22,28 10,28 4,22 4,10"
            fill="#10B981"
            stroke="#047857"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <polygon
            points="11,9 21,9 23,11 23,21 21,23 11,23 9,21 9,11"
            fill="#6EE7B7"
          />
          <polygon
            points="11,9 21,9 19,14 13,14"
            fill="#A7F3D0"
            opacity="0.85"
          />
        </svg>
      );
    case 'star_orange':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
          <polygon
            points="16,3 19.8,11.2 28.8,12.2 22.1,18.4 23.9,27.3 16,22.8 8.1,27.3 9.9,18.4 3.2,12.2 12.2,11.2"
            fill="#F97316"
            stroke="#C2410C"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <polygon
            points="16,6 18.6,12 24.8,12.7 20.1,17 21.4,23.2 16,20.1 10.6,23.2 11.9,17 7.2,12.7 13.4,12"
            fill="#FDBA74"
            opacity="0.7"
          />
        </svg>
      );
    case 'ruby_red':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
          <polygon
            points="16,4 27,12 23,27 9,27 5,12"
            fill="#EF4444"
            stroke="#991B1B"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <polygon points="16,4 22,12 10,12" fill="#FCA5A5" />
          <polygon points="10,12 22,12 19,23 13,23" fill="#F87171" />
        </svg>
      );
    case 'amethyst_purple':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
          <polygon
            points="16,3 27,16 16,29 5,16"
            fill="#A855F7"
            stroke="#6B21A8"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <polygon points="16,3 22,16 16,13 10,16" fill="#E9D5FF" />
          <polygon
            points="16,13 22,16 16,29 10,16"
            fill="#C084FC"
            opacity="0.8"
          />
        </svg>
      );
  }
};

interface BlockTileProps {
  color: ColorId;
  gem?: GemType;
  previewColor?: ColorId;
  isClearing?: boolean;
  isClearPreview?: boolean;
  isPlacedAnim?: boolean;
  className?: string;
}

export const BlockTile: React.FC<BlockTileProps> = ({
  color,
  gem,
  previewColor,
  isClearing = false,
  isClearPreview = false,
  isPlacedAnim = false,
  className = '',
}) => {
  // Just like in the Block Blast videos: when hovering a valid line clear,
  // blocks in that row/column morph to the active piece's color!
  const effectiveColor: ColorId = gem
    ? 'stone'
    : isClearPreview && previewColor
      ? previewColor
      : color;
  const palette = COLOR_PALETTE[effectiveColor];

  return (
    <div
      className={`relative w-full h-full rounded-[5px] border-t-[2.5px] border-l-[1.5px] border-r-[1.5px] border-b-[3.5px] border-l-white/25 border-r-black/25 flex items-center justify-center ${palette.bg} ${palette.borderTop} ${palette.borderBottom} shadow-sm transition-all duration-100 ${
        isClearing ? 'animate-cell-clear' : ''
      } ${isPlacedAnim ? 'animate-cell-place' : ''} ${
        isClearPreview
          ? 'brightness-120 scale-[1.03] ring-2 ring-white/85 z-10'
          : ''
      } ${className}`}
    >
      <div className="pointer-events-none absolute inset-[3px] rounded-[2.5px] border-t border-white/30 bg-gradient-to-br from-white/25 via-transparent to-black/20" />
      {gem && (
        <GemIcon
          gem={gem}
          className="relative z-10 w-[72%] h-[72%] drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]"
        />
      )}
    </div>
  );
};

interface PieceMatrixProps {
  matrix: number[][];
  color: ColorId;
  gems?: (GemType | null)[][];
  cellSizePx: number;
  gapPx?: number;
  dimmed?: boolean;
}

export const PieceMatrix: React.FC<PieceMatrixProps> = ({
  matrix,
  color,
  gems,
  cellSizePx,
  gapPx = 3,
  dimmed = false,
}) => {
  const cols = matrix[0].length;
  const rows = matrix.length;

  return (
    <div
      className={`grid select-none transition-opacity duration-150 ${
        dimmed ? 'opacity-45' : 'opacity-100'
      }`}
      style={{
        gridTemplateColumns: `repeat(${cols}, ${cellSizePx}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSizePx}px)`,
        gap: `${gapPx}px`,
      }}
    >
      {matrix.map((row, rIdx) =>
        row.map((val, cIdx) => {
          const cellGem = gems?.[rIdx]?.[cIdx] ?? undefined;
          return (
            <div key={`${rIdx}-${cIdx}`} className="w-full h-full">
              {val === 1 ? (
                <BlockTile color={cellGem ? 'stone' : color} gem={cellGem} />
              ) : null}
            </div>
          );
        }),
      )}
    </div>
  );
};
