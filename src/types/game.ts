export type GameMode = 'adventure' | 'boardclear' | 'blockblast' | 'blocksturz';

export type GameState =
  | 'TITLE_MENU'
  | 'ADVENTURE_MAP'
  | 'PLAYING'
  | 'LEVEL_COMPLETE'
  | 'GAME_OVER';

export type Language = 'de' | 'en';

export type ColorId =
  | 'gold'
  | 'stone'
  | 'cobalt'
  | 'amber'
  | 'emerald'
  | 'coral'
  | 'cyan'
  | 'indigo'
  | 'purple'
  | 'rose';

export type GemType =
  | 'diamond_blue'
  | 'emerald_green'
  | 'star_orange'
  | 'ruby_red'
  | 'amethyst_purple';

export interface CellData {
  color: ColorId;
  gem?: GemType;
}

export type GridCell = CellData | null;

export type Grid = GridCell[][];

export interface PieceShape {
  id: string;
  matrix: number[][];
  color: ColorId;
  weight: number;
  gems?: (GemType | null)[][];
}

export interface DockPiece {
  uid: string;
  shape: PieceShape;
  used: boolean;
}

export interface ClearPreview {
  rows: number[];
  cols: number[];
  clearedCells: Set<string>;
  linesCount: number;
}

export interface LineBlastEffect {
  id: string;
  rows: number[];
  cols: number[];
  color: ColorId;
}

export interface ScorePopup {
  id: string;
  points: number;
  label?: string;
  praise?: string;
  comboCount?: number;
  isAllClear?: boolean;
  row: number;
  col: number;
}

export interface DragState {
  pieceUid: string;
  shape: PieceShape;
  pointerX: number;
  pointerY: number;
  isTouch: boolean;
  hoverRow: number | null;
  hoverCol: number | null;
  isValidDrop: boolean;
  preview: ClearPreview | null;
}

export interface SavedClassicRun {
  mode: 'blockblast';
  grid: Grid;
  dock: DockPiece[];
  score: number;
  combo: number;
  turnsSinceClear: number;
  linesCleared: number;
  bestCombo: number;
}

export interface AdventureLevelDef {
  level: number;
  type: 'score' | 'collect';
  targetScore?: number;
  targets?: Partial<Record<GemType, number>>;
  initialGrid: Grid;
}

export interface BoardClearStageDef {
  stage: number;
  titleDe: string;
  titleEn: string;
  initialGrid: Grid;
  presetDeals?: PieceShape[][];
}
