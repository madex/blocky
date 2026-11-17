import type { ColorId, GameMode, GemType, Grid, PieceShape } from '../types/game';
import { canPlacePiece, placePieceAndResolve } from '../utils/gameLogic';

export const COLOR_PALETTE: Record<
  ColorId,
  {
    bg: string;
    borderTop: string;
    borderBottom: string;
    glow: string;
    ghost: string;
    hex: string;
  }
> = {
  gold: {
    bg: 'bg-amber-400',
    borderTop: 'border-t-yellow-200/95',
    borderBottom: 'border-b-amber-600/95',
    glow: 'shadow-amber-400/35',
    ghost: 'bg-amber-300/40 border-amber-200/85',
    hex: '#fbbf24',
  },
  stone: {
    bg: 'bg-[#DFC9A6]',
    borderTop: 'border-t-[#F5EAD4]',
    borderBottom: 'border-b-[#9E8460]',
    glow: 'shadow-amber-200/25',
    ghost: 'bg-[#DFC9A6]/40 border-[#F5EAD4]/85',
    hex: '#dfc9a6',
  },
  cobalt: {
    bg: 'bg-blue-500',
    borderTop: 'border-t-blue-300/90',
    borderBottom: 'border-b-blue-800/90',
    glow: 'shadow-blue-500/35',
    ghost: 'bg-blue-400/40 border-blue-300/80',
    hex: '#3b82f6',
  },
  amber: {
    bg: 'bg-amber-400',
    borderTop: 'border-t-amber-200/90',
    borderBottom: 'border-b-amber-700/90',
    glow: 'shadow-amber-400/35',
    ghost: 'bg-amber-300/40 border-amber-200/80',
    hex: '#fbbf24',
  },
  emerald: {
    bg: 'bg-emerald-500',
    borderTop: 'border-t-emerald-300/90',
    borderBottom: 'border-b-emerald-800/90',
    glow: 'shadow-emerald-500/35',
    ghost: 'bg-emerald-400/40 border-emerald-200/80',
    hex: '#10b981',
  },
  coral: {
    bg: 'bg-orange-500',
    borderTop: 'border-t-orange-300/90',
    borderBottom: 'border-b-orange-800/90',
    glow: 'shadow-orange-500/35',
    ghost: 'bg-orange-400/40 border-orange-200/80',
    hex: '#f97316',
  },
  cyan: {
    bg: 'bg-sky-400',
    borderTop: 'border-t-sky-200/90',
    borderBottom: 'border-b-sky-700/90',
    glow: 'shadow-sky-400/35',
    ghost: 'bg-sky-300/40 border-sky-200/80',
    hex: '#38bdf8',
  },
  indigo: {
    bg: 'bg-indigo-500',
    borderTop: 'border-t-indigo-300/90',
    borderBottom: 'border-b-indigo-800/90',
    glow: 'shadow-indigo-500/35',
    ghost: 'bg-indigo-400/40 border-indigo-200/80',
    hex: '#6366f1',
  },
  purple: {
    bg: 'bg-purple-500',
    borderTop: 'border-t-purple-300/90',
    borderBottom: 'border-b-purple-800/90',
    glow: 'shadow-purple-500/35',
    ghost: 'bg-purple-400/40 border-purple-200/80',
    hex: '#a855f7',
  },
  rose: {
    bg: 'bg-rose-500',
    borderTop: 'border-t-rose-300/90',
    borderBottom: 'border-b-rose-800/90',
    glow: 'shadow-rose-500/35',
    ghost: 'bg-rose-400/40 border-rose-200/80',
    hex: '#f43f5e',
  },
};

export const PIECE_CATALOG: PieceShape[] = [
  { id: 'dot_1', matrix: [[1]], color: 'gold', weight: 4 },
  { id: 'bar_2h', matrix: [[1, 1]], color: 'cyan', weight: 10 },
  { id: 'bar_2v', matrix: [[1], [1]], color: 'cyan', weight: 10 },
  { id: 'bar_3h', matrix: [[1, 1, 1]], color: 'cobalt', weight: 11 },
  { id: 'bar_3v', matrix: [[1], [1], [1]], color: 'cobalt', weight: 11 },
  { id: 'bar_4h', matrix: [[1, 1, 1, 1]], color: 'emerald', weight: 8 },
  { id: 'bar_4v', matrix: [[1], [1], [1], [1]], color: 'emerald', weight: 8 },
  { id: 'bar_5h', matrix: [[1, 1, 1, 1, 1]], color: 'rose', weight: 5 },
  { id: 'bar_5v', matrix: [[1], [1], [1], [1], [1]], color: 'rose', weight: 5 },

  {
    id: 'sq_2',
    matrix: [
      [1, 1],
      [1, 1],
    ],
    color: 'gold',
    weight: 12,
  },
  {
    id: 'sq_3',
    matrix: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
    color: 'emerald',
    weight: 4.5,
  },
  {
    id: 'rect_2x3',
    matrix: [
      [1, 1, 1],
      [1, 1, 1],
    ],
    color: 'coral',
    weight: 5,
  },
  {
    id: 'rect_3x2',
    matrix: [
      [1, 1],
      [1, 1],
      [1, 1],
    ],
    color: 'amber',
    weight: 5,
  },

  {
    id: 'l2_a',
    matrix: [
      [1, 0],
      [1, 1],
    ],
    color: 'emerald',
    weight: 8.5,
  },
  {
    id: 'l2_b',
    matrix: [
      [0, 1],
      [1, 1],
    ],
    color: 'emerald',
    weight: 8.5,
  },
  {
    id: 'l2_c',
    matrix: [
      [1, 1],
      [1, 0],
    ],
    color: 'emerald',
    weight: 8.5,
  },
  {
    id: 'l2_d',
    matrix: [
      [1, 1],
      [0, 1],
    ],
    color: 'emerald',
    weight: 8.5,
  },

  {
    id: 'l3_a',
    matrix: [
      [1, 0, 0],
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: 'purple',
    weight: 4,
  },
  {
    id: 'l3_b',
    matrix: [
      [0, 0, 1],
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: 'purple',
    weight: 4,
  },
  {
    id: 'l3_c',
    matrix: [
      [1, 1, 1],
      [1, 0, 0],
      [1, 0, 0],
    ],
    color: 'purple',
    weight: 4,
  },
  {
    id: 'l3_d',
    matrix: [
      [1, 1, 1],
      [0, 0, 1],
      [0, 0, 1],
    ],
    color: 'coral',
    weight: 4,
  },

  {
    id: 'tet_l1',
    matrix: [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    color: 'amber',
    weight: 6.5,
  },
  {
    id: 'tet_l2',
    matrix: [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
    color: 'emerald',
    weight: 6.5,
  },
  {
    id: 'tet_l3',
    matrix: [
      [1, 1, 1],
      [1, 0, 0],
    ],
    color: 'coral',
    weight: 6.5,
  },
  {
    id: 'tet_l4',
    matrix: [
      [1, 1, 1],
      [0, 0, 1],
    ],
    color: 'cobalt',
    weight: 6.5,
  },
  {
    id: 'tet_j1',
    matrix: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: 'cyan',
    weight: 6.5,
  },
  {
    id: 'tet_j2',
    matrix: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: 'purple',
    weight: 6.5,
  },

  {
    id: 't_up',
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: 'purple',
    weight: 6,
  },
  {
    id: 't_down',
    matrix: [
      [1, 1, 1],
      [0, 1, 0],
    ],
    color: 'amber',
    weight: 6,
  },
  {
    id: 't_left',
    matrix: [
      [0, 1],
      [1, 1],
      [0, 1],
    ],
    color: 'cobalt',
    weight: 6,
  },
  {
    id: 't_right',
    matrix: [
      [1, 0],
      [1, 1],
      [1, 0],
    ],
    color: 'coral',
    weight: 6,
  },

  {
    id: 'z_h',
    matrix: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: 'rose',
    weight: 5,
  },
  {
    id: 's_h',
    matrix: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: 'emerald',
    weight: 5,
  },
  {
    id: 'z_v',
    matrix: [
      [0, 1],
      [1, 1],
      [1, 0],
    ],
    color: 'cyan',
    weight: 5,
  },
  {
    id: 's_v',
    matrix: [
      [1, 0],
      [1, 1],
      [0, 1],
    ],
    color: 'rose',
    weight: 5,
  },

  {
    id: 'diag_2a',
    matrix: [
      [1, 0],
      [0, 1],
    ],
    color: 'gold',
    weight: 1.5,
  },
  {
    id: 'diag_2b',
    matrix: [
      [0, 1],
      [1, 0],
    ],
    color: 'emerald',
    weight: 1.5,
  },
];

const BULKY_IDS = new Set([
  'sq_3',
  'rect_2x3',
  'rect_3x2',
  'l3_a',
  'l3_b',
  'l3_c',
  'l3_d',
  'bar_5h',
  'bar_5v',
]);

export const CLASSIC_COLORS: ColorId[] = [
  'cobalt',
  'amber',
  'emerald',
  'coral',
  'cyan',
  'purple',
  'rose',
];

export function randomClassicColor(): ColorId {
  return CLASSIC_COLORS[Math.floor(Math.random() * CLASSIC_COLORS.length)];
}

function countOccupied(grid: Grid): number {
  let count = 0;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] !== null) count++;
    }
  }
  return count;
}

export function canShapeFitAnywhere(grid: Grid, matrix: number[][]): boolean {
  const size = grid.length;
  const rows = matrix.length;
  const cols = matrix[0].length;
  for (let r = 0; r <= size - rows; r++) {
    for (let c = 0; c <= size - cols; c++) {
      if (canPlacePiece(grid, matrix, r, c)) {
        return true;
      }
    }
  }
  return false;
}

interface CandidateEval {
  item: PieceShape;
  effectiveWeight: number;
  bestNextGrid: Grid;
  clearsLine: boolean;
}

function evaluateCatalogForGrid(
  simGrid: Grid,
  allowBulky: boolean,
): CandidateEval[] {
  const size = simGrid.length;
  const occupied = countOccupied(simGrid);
  const results: CandidateEval[] = [];

  for (const item of PIECE_CATALOG) {
    const isBulky = BULKY_IDS.has(item.id);
    if (!allowBulky && isBulky) continue;

    const pRows = item.matrix.length;
    const pCols = item.matrix[0].length;

    let bestPlacementScore = -Infinity;
    let bestNextGrid: Grid | null = null;
    let canClearAnyLine = false;

    for (let r = 0; r <= size - pRows; r++) {
      for (let c = 0; c <= size - pCols; c++) {
        if (!canPlacePiece(simGrid, item.matrix, r, c)) continue;

        const res = placePieceAndResolve(simGrid, item, r, c, 0, 0, 0);
        const lines = res.clearInfo.linesCount;
        if (lines > 0) canClearAnyLine = true;

        const afterOcc = countOccupied(res.finalGrid);
        const placementScore = lines * 300 - afterOcc * 4;

        if (placementScore > bestPlacementScore) {
          bestPlacementScore = placementScore;
          bestNextGrid = res.finalGrid;
        }
      }
    }

    if (!bestNextGrid) continue;

    // On crowded boards without a line clear, suppress huge 3x3/5-bars
    if (occupied >= 34 && isBulky && !canClearAnyLine) continue;

    let effectiveWeight = item.weight;
    if (canClearAnyLine) {
      // Mercy & flow boost: the fuller the board, the likelier a line-completing piece appears
      effectiveWeight *= occupied >= 28 ? 4.4 : occupied >= 18 ? 2.6 : 1.5;
    }

    results.push({
      item,
      effectiveWeight,
      bestNextGrid,
      clearsLine: canClearAnyLine,
    });
  }

  return results;
}

function pickWeightedEval(candidates: CandidateEval[]): CandidateEval {
  const total = candidates.reduce((sum, c) => sum + c.effectiveWeight, 0);
  let roll = Math.random() * total;
  for (const cand of candidates) {
    roll -= cand.effectiveWeight;
    if (roll <= 0) return cand;
  }
  return candidates[candidates.length - 1];
}

function attachGemsToDeal(
  shapes: PieceShape[],
  remainingTargets?: Partial<Record<GemType, number>>,
): PieceShape[] {
  if (!remainingTargets) return shapes;

  const activeEntries = (
    Object.entries(remainingTargets) as [GemType, number][]
  ).filter(([, count]) => count > 0);

  if (activeEntries.length === 0) return shapes;

  // Weight gem selection toward whichever gem still needs the most
  const pickNeededGem = (): GemType => {
    const totalRem = activeEntries.reduce((s, [, c]) => s + c, 0);
    let r = Math.random() * totalRem;
    for (const [gem, count] of activeEntries) {
      r -= count;
      if (r <= 0) return gem;
    }
    return activeEntries[0][0];
  };

  // Guarantee at least 2 of the 3 pieces carry gems when gems remain!
  const gemSlotIndices = new Set<number>();
  const order = [0, 1, 2].sort(() => Math.random() - 0.5);
  gemSlotIndices.add(order[0]);
  if (shapes.length >= 2) gemSlotIndices.add(order[1]);
  if (shapes.length >= 3 && Math.random() < 0.45) gemSlotIndices.add(order[2]);

  return shapes.map((shape, idx) => {
    if (!gemSlotIndices.has(idx)) return shape;

    const filledPositions: [number, number][] = [];
    for (let r = 0; r < shape.matrix.length; r++) {
      for (let c = 0; c < shape.matrix[0].length; c++) {
        if (shape.matrix[r][c] === 1) {
          filledPositions.push([r, c]);
        }
      }
    }
    if (filledPositions.length === 0) return shape;

    const gemsGrid: (GemType | null)[][] = shape.matrix.map((row) =>
      row.map(() => null),
    );

    const primaryGem = pickNeededGem();
    const maxGems =
      filledPositions.length >= 4
        ? Math.random() < 0.55
          ? 3
          : 2
        : filledPositions.length >= 2
          ? 2
          : 1;

    const shuffled = [...filledPositions].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(maxGems, shuffled.length); i++) {
      const [r, c] = shuffled[i];
      gemsGrid[r][c] = i === 0 ? primaryGem : pickNeededGem();
    }

    return {
      ...shape,
      gems: gemsGrid,
    };
  });
}

export function wrapShapesAsDock(shapes: PieceShape[]) {
  const stamp = Date.now().toString(36);
  return shapes.map((shape, idx) => ({
    uid: `p_${stamp}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
    shape,
    used: false,
  }));
}

/**
 * Smart 3-Piece Playable Sequence Dealer:
 * Simulates a valid 3-piece trajectory (including intermediate line clears)
 * so every fresh 3-piece hand has a guaranteed playable path!
 */
export function generatePieceSet(
  grid: Grid,
  mode: GameMode,
  remainingTargets?: Partial<Record<GemType, number>>,
) {
  let simGrid = grid;
  let bulkyCount = 0;
  let shapes: PieceShape[] = [];

  for (let slot = 0; slot < 3; slot++) {
    const occupied = countOccupied(simGrid);
    const allowBulky = occupied < 18 || bulkyCount === 0;
    let candidates = evaluateCatalogForGrid(simGrid, allowBulky);

    if (candidates.length === 0 && !allowBulky) {
      candidates = evaluateCatalogForGrid(simGrid, true);
    }

    if (candidates.length > 0) {
      const picked = pickWeightedEval(candidates);
      if (BULKY_IDS.has(picked.item.id)) bulkyCount++;
      shapes.push({
        ...picked.item,
        color: randomClassicColor(),
      });
      simGrid = picked.bestNextGrid;
    } else {
      const fallback = PIECE_CATALOG[Math.floor(Math.random() * 5)];
      shapes.push({
        ...fallback,
        color: randomClassicColor(),
      });
    }
  }

  // Shuffle order of the 3 pieces so slot 0 isn't always the first step of the trajectory,
  // EXCEPT ensure at least 1 piece fits immediately on the current `grid` (which slot 0 already does,
  // and shuffling preserves that at least one piece in the dock fits `grid`!).
  shapes = shapes.sort(() => Math.random() - 0.5);

  if (mode === 'adventure' && remainingTargets) {
    shapes = attachGemsToDeal(shapes, remainingTargets);
  }

  return wrapShapesAsDock(shapes);
}
