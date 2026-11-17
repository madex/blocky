import React from 'react';
import { canShapeFitAnywhere } from '../data/pieces';
import type { DockPiece, Grid } from '../types/game';
import { PieceMatrix } from './BlockTile';

interface PieceDockProps {
  dock: DockPiece[];
  grid: Grid;
  activeDragUid: string | null;
  selectedUid: string | null;
  dealKey: number;
  onStartDrag: (
    e: React.PointerEvent<HTMLDivElement>,
    piece: DockPiece,
  ) => void;
  onSelectPiece: (uid: string) => void;
}

export const PieceDock: React.FC<PieceDockProps> = ({
  dock,
  grid,
  activeDragUid,
  selectedUid,
  dealKey,
  onStartDrag,
  onSelectPiece,
}) => {
  const layoutClass =
    dock.length === 1
      ? 'grid-cols-1 max-w-[160px]'
      : dock.length === 2
        ? 'grid-cols-2 max-w-[310px]'
        : 'grid-cols-3 max-w-[min(92vw,47dvh)] sm:max-w-[460px]';

  return (
    <div
      className={`w-full mx-auto grid ${layoutClass} gap-2 sm:gap-3.5 pt-1.5 sm:pt-2 touch-none`}
    >
      {dock.map((piece, idx) => {
        const isDraggingThis = activeDragUid === piece.uid;
        const isSelected = selectedUid === piece.uid;
        const fits = !piece.used && canShapeFitAnywhere(grid, piece.shape.matrix);

        const maxDim = Math.max(
          piece.shape.matrix.length,
          piece.shape.matrix[0].length,
        );
        const previewCellSize = maxDim >= 4 ? 13 : maxDim === 3 ? 16 : 19;

        return (
          <div
            key={`${dealKey}_${piece.uid}`}
            style={{
              animationDelay: `${idx * 45}ms`,
              touchAction: 'none',
            }}
            onPointerDown={(e) => {
              if (piece.used) return;
              onStartDrag(e, piece);
            }}
            onClick={() => {
              if (piece.used) return;
              onSelectPiece(piece.uid);
            }}
            role="button"
            tabIndex={piece.used ? -1 : 0}
            aria-disabled={piece.used}
            aria-label={`Piece ${idx + 1}`}
            onKeyDown={(e) => {
              if (!piece.used && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onSelectPiece(piece.uid);
              }
            }}
            className={`animate-piece-deal relative h-[82px] sm:h-[108px] rounded-xl flex items-center justify-center transition-all duration-150 select-none ${
              piece.used
                ? 'bg-[#111936]/35 border border-white/5 pointer-events-none'
                : isSelected
                  ? 'bg-[#1D2B58] border-2 border-sky-400 shadow-lg shadow-sky-500/20 cursor-grab active:cursor-grabbing'
                  : 'bg-[#141E3D]/85 border border-white/10 hover:border-white/25 hover:bg-[#19264C] cursor-grab active:cursor-grabbing'
            }`}
          >
            {!piece.used && !isDraggingThis && (
              <div className="pointer-events-none flex items-center justify-center">
                <PieceMatrix
                  matrix={piece.shape.matrix}
                  color={piece.shape.color}
                  gems={piece.shape.gems}
                  cellSizePx={previewCellSize}
                  gapPx={2}
                  dimmed={!fits}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
