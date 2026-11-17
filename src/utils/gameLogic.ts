import type {
  ClearPreview,
  DockPiece,
  GameMode,
  GemType,
  Grid,
  PieceShape,
} from '../types/game';

export function getGridSize(_mode?: GameMode): number {
  return 8;
}

export function createEmptyGrid(size: number): Grid {
  return Array.from({ length: size }, () => Array<null>(size).fill(null));
}

export function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

export function canPlacePiece(
  grid: Grid,
  matrix: number[][],
  startRow: number,
  startCol: number,
): boolean {
  const size = grid.length;
  const rows = matrix.length;
  const cols = matrix[0].length;

  if (
    startRow < 0 ||
    startCol < 0 ||
    startRow + rows > size ||
    startCol + cols > size
  ) {
    return false;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (matrix[r][c] === 1 && grid[startRow + r][startCol + c] !== null) {
        return false;
      }
    }
  }
  return true;
}

export function hasAnyValidMove(grid: Grid, dock: DockPiece[]): boolean {
  const size = grid.length;
  for (const item of dock) {
    if (item.used) continue;
    const { matrix } = item.shape;
    const rows = matrix.length;
    const cols = matrix[0].length;
    for (let r = 0; r <= size - rows; r++) {
      for (let c = 0; c <= size - cols; c++) {
        if (canPlacePiece(grid, matrix, r, c)) {
          return true;
        }
      }
    }
  }
  return false;
}

export function computeClearsOnGrid(grid: Grid): ClearPreview {
  const size = grid.length;
  const rows: number[] = [];
  const cols: number[] = [];
  const clearedCells = new Set<string>();

  for (let r = 0; r < size; r++) {
    if (grid[r].every((cell) => cell !== null)) {
      rows.push(r);
      for (let c = 0; c < size; c++) {
        clearedCells.add(`${r},${c}`);
      }
    }
  }

  for (let c = 0; c < size; c++) {
    let full = true;
    for (let r = 0; r < size; r++) {
      if (grid[r][c] === null) {
        full = false;
        break;
      }
    }
    if (full) {
      cols.push(c);
      for (let r = 0; r < size; r++) {
        clearedCells.add(`${r},${c}`);
      }
    }
  }

  return {
    rows,
    cols,
    clearedCells,
    linesCount: rows.length + cols.length,
  };
}

export function getPreviewClears(
  grid: Grid,
  shape: PieceShape,
  startRow: number,
  startCol: number,
): ClearPreview | null {
  if (!canPlacePiece(grid, shape.matrix, startRow, startCol)) {
    return null;
  }

  const simulated = cloneGrid(grid);
  for (let r = 0; r < shape.matrix.length; r++) {
    for (let c = 0; c < shape.matrix[0].length; c++) {
      if (shape.matrix[r][c] === 1) {
        const gem = shape.gems?.[r]?.[c] ?? undefined;
        simulated[startRow + r][startCol + c] = {
          color: gem ? 'stone' : shape.color,
          gem,
        };
      }
    }
  }

  return computeClearsOnGrid(simulated);
}

export interface PlacementResolution {
  placedGrid: Grid;
  finalGrid: Grid;
  clearInfo: ClearPreview;
  collectedGems: Partial<Record<GemType, number>>;
  pointsEarned: number;
  newCombo: number;
  newTurnsSinceClear: number;
  allClear: boolean;
  placedCenterRow: number;
  placedCenterCol: number;
}

export function placePieceAndResolve(
  grid: Grid,
  shape: PieceShape,
  startRow: number,
  startCol: number,
  currentCombo: number,
  turnsSinceClear: number,
  totalLinesClearedBefore = 0,
): PlacementResolution {
  const next = cloneGrid(grid);
  let cellCount = 0;

  for (let r = 0; r < shape.matrix.length; r++) {
    for (let c = 0; c < shape.matrix[0].length; c++) {
      if (shape.matrix[r][c] === 1) {
        const gem = shape.gems?.[r]?.[c] ?? undefined;
        next[startRow + r][startCol + c] = {
          color: gem ? 'stone' : shape.color,
          gem,
        };
        cellCount++;
      }
    }
  }

  const clearInfo = computeClearsOnGrid(next);
  const finalGrid = cloneGrid(next);
  const collectedGems: Partial<Record<GemType, number>> = {};

  for (const key of clearInfo.clearedCells) {
    const [rStr, cStr] = key.split(',');
    const r = Number(rStr);
    const c = Number(cStr);
    const cell = next[r][c];
    if (cell?.gem) {
      collectedGems[cell.gem] = (collectedGems[cell.gem] ?? 0) + 1;
    }
    finalGrid[r][c] = null;
  }

  const basePlacePoints = cellCount * 2;
  let clearPoints = 0;
  let newCombo = currentCombo;
  let newTurnsSinceClear = turnsSinceClear + 1;

  if (clearInfo.linesCount > 0) {
    // Combo increments if cleared within 3 turns of last clear (just like Block Blast)
    newCombo = turnsSinceClear <= 2 ? currentCombo + 1 : 1;
    newTurnsSinceClear = 0;

    const k = clearInfo.linesCount;
    let progressiveBase = 0;
    for (let i = 0; i < k; i++) {
      progressiveBase += 20 + (totalLinesClearedBefore + i) * 5;
    }
    const multiLineBonus = k > 1 ? (k - 1) * 40 : 0;
    const comboBonus = (newCombo - 1) * 20;
    clearPoints =
      Math.round(
        ((progressiveBase + multiLineBonus + comboBonus) * (1 + (k - 1) * 0.35)) /
          5,
      ) * 5;
  } else if (newTurnsSinceClear >= 3) {
    newCombo = 0;
  }

  const allClear =
    clearInfo.linesCount > 0 &&
    finalGrid.every((row) => row.every((cell) => cell === null));

  const allClearBonus = allClear ? 300 : 0;

  return {
    placedGrid: next,
    finalGrid,
    clearInfo,
    collectedGems,
    pointsEarned: basePlacePoints + clearPoints + allClearBonus,
    newCombo,
    newTurnsSinceClear,
    allClear,
    placedCenterRow: startRow + (shape.matrix.length - 1) / 2,
    placedCenterCol: startCol + (shape.matrix[0].length - 1) / 2,
  };
}
