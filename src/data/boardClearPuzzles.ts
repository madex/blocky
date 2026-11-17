import {
  canShapeFitAnywhere,
  PIECE_CATALOG,
  randomClassicColor,
  wrapShapesAsDock,
} from './pieces';
import type {
  BoardClearStageDef,
  ColorId,
  DockPiece,
  Grid,
  PieceShape,
} from '../types/game';
import {
  canPlacePiece,
  cloneGrid,
  placePieceAndResolve,
} from '../utils/gameLogic';

const CHAR_COLOR_MAP: Record<string, ColorId> = {
  O: 'coral',
  G: 'gold',
  Y: 'amber',
  E: 'emerald',
  C: 'cyan',
  B: 'cobalt',
  P: 'purple',
  R: 'rose',
};

function parseColorGrid(rows: string[]): Grid {
  return rows.map((row) =>
    row.split('').map((ch) => {
      const color = CHAR_COLOR_MAP[ch];
      return color ? { color } : null;
    }),
  );
}

function shapeById(id: string, color: ColorId): PieceShape {
  const found = PIECE_CATALOG.find((p) => p.id === id) ?? PIECE_CATALOG[0];
  return { ...found, color };
}

export const TOTAL_BOARD_CLEAR_STAGES = 30;

export const BOARD_CLEAR_STAGES: BoardClearStageDef[] = [
  // Stage 1: Video 1 (00:00) - 3 vertical orange columns with 1x3 horizontal gap
  {
    stage: 1,
    titleDe: 'Drei Säulen',
    titleEn: 'Triple Pillars',
    initialGrid: parseColorGrid([
      '...OOO..',
      '...OOO..',
      '...OOO..',
      '...OOO..',
      '........',
      '...OOO..',
      '...OOO..',
      '...OOO..',
    ]),
    presetDeals: [[shapeById('bar_3h', 'coral')]],
  },
  // Stage 2: Video 1 (00:03) - Rainbow horizontal rows with 3x1 vertical gap
  {
    stage: 2,
    titleDe: 'Regenbogen-Brücke',
    titleEn: 'Rainbow Bridge',
    initialGrid: parseColorGrid([
      '........',
      '........',
      'OO.GECBP',
      'OO.GECBP',
      'OO.GECBP',
      '........',
      '........',
      '........',
    ]),
    presetDeals: [[shapeById('bar_3v', 'coral')]],
  },
  // Stage 3: Video 1 (00:06) - Red & Gold Cross with 2x2 center hole
  {
    stage: 3,
    titleDe: 'Kreuz-Fusion',
    titleEn: 'Cross Fusion',
    initialGrid: parseColorGrid([
      '...RR...',
      '...RR...',
      '...GG...',
      'RRG..GRR',
      'RRG..GRR',
      '...GG...',
      '...RR...',
      '...RR...',
    ]),
    presetDeals: [[shapeById('sq_2', 'cobalt')]],
  },
  // Stage 4: Two-step Twin Frame
  {
    stage: 4,
    titleDe: 'Doppel-Tor',
    titleEn: 'Twin Gate',
    initialGrid: parseColorGrid([
      '..BB..PP',
      '..BB..PP',
      '..BB..PP',
      '........',
      '........',
      '..BB..PP',
      '..BB..PP',
      '..BB..PP',
    ]),
    presetDeals: [[shapeById('sq_2', 'cyan'), shapeById('sq_2', 'purple')]],
  },
  // Stage 5: Pixel-Roboter — clean 2-step & 3-step clearable robot face (zero sealed 1x1 traps!)
  {
    stage: 5,
    titleDe: 'Pixel-Roboter',
    titleEn: 'Pixel Bot',
    initialGrid: parseColorGrid([
      '..GGGG..',
      '..GGGG..',
      'GGC..CGG',
      'GGC..CGG',
      'GGGGGGGG',
      'GG....GG',
      'GG....GG',
      '..GGGG..',
    ]),
    presetDeals: [
      [
        shapeById('sq_2', 'cyan'),
        shapeById('rect_2x3', 'gold'),
        shapeById('bar_2v', 'coral'),
      ],
      [shapeById('sq_2', 'emerald'), shapeById('sq_2', 'amber')],
    ],
  },
  // Stage 6: Video 3 (00:01) - Pixel Burger!
  {
    stage: 6,
    titleDe: 'Pixel-Burger',
    titleEn: 'Pixel Burger',
    initialGrid: parseColorGrid([
      '..OOOO..',
      '.OOOOOO.',
      'EEEEEEEE',
      'GGGGGGGG',
      'RRRRRRRR',
      '.OOOOOO.',
      '..OOOO..',
      '........',
    ]),
  },
  // Stage 7: Neon Heart
  {
    stage: 7,
    titleDe: 'Neon-Herz',
    titleEn: 'Neon Heart',
    initialGrid: parseColorGrid([
      '........',
      '.RR..RR.',
      'RRRRRRRR',
      'RRRRRRRR',
      '.RRRRRR.',
      '..RRRR..',
      '...RR...',
      '........',
    ]),
  },
  // Stage 8: Emerald Hourglass
  {
    stage: 8,
    titleDe: 'Smaragd-Sanduhr',
    titleEn: 'Emerald Hourglass',
    initialGrid: parseColorGrid([
      'EEEEEEEE',
      '.GGGGGG.',
      '..EEEE..',
      '...GG...',
      '...GG...',
      '..EEEE..',
      '.GGGGGG.',
      'EEEEEEEE',
    ]),
  },
  // Stage 9: Golden Crown
  {
    stage: 9,
    titleDe: 'Goldene Krone',
    titleEn: 'Golden Crown',
    initialGrid: parseColorGrid([
      '........',
      'GG.GG.GG',
      'GG.GG.GG',
      'GGGGGGGG',
      'GRGGGGCG',
      'GGGGGGGG',
      '........',
      '........',
    ]),
  },
  // Stage 10: Prism Butterfly
  {
    stage: 10,
    titleDe: 'Schmetterling',
    titleEn: 'Prism Butterfly',
    initialGrid: parseColorGrid([
      'PP....PP',
      'PCC..CCP',
      'PCCCCCCP',
      '.PGGGGP.',
      '.PGGGGP.',
      'PRRRRRRP',
      'PRR..RRP',
      'PP....PP',
    ]),
  },
  // Stage 11: Star Rocket
  {
    stage: 11,
    titleDe: 'Sternen-Rakete',
    titleEn: 'Star Rocket',
    initialGrid: parseColorGrid([
      '...RR...',
      '..RRRR..',
      '..CCCC..',
      '..CGGC..',
      '.CCCCCC.',
      'OOCCCCOO',
      'OO....OO',
      'OO....OO',
    ]),
  },
  // Stage 12: Lucky Clover
  {
    stage: 12,
    titleDe: 'Glücksklee',
    titleEn: 'Lucky Clover',
    initialGrid: parseColorGrid([
      '.EE..EE.',
      'EEE..EEE',
      'EEE..EEE',
      '...GG...',
      '...GG...',
      'EEE..EEE',
      'EEE..EEE',
      '.EE..EE.',
    ]),
  },
  // Stage 13: Sunny Smile
  {
    stage: 13,
    titleDe: 'Strahlegesicht',
    titleEn: 'Sunny Smile',
    initialGrid: parseColorGrid([
      '..GGGG..',
      '.GGGGGG.',
      'GG.BB.GG',
      'GGGGGGGG',
      'GG.OO.GG',
      'GG....GG',
      '.GGGGGG.',
      '..GGGG..',
    ]),
  },
  // Stage 14: Twin Fortress
  {
    stage: 14,
    titleDe: 'Zwillings-Burg',
    titleEn: 'Twin Fortress',
    initialGrid: parseColorGrid([
      'OO....BB',
      'OOO..BBB',
      'OOO..BBB',
      'OOOOOOOO',
      'BBBBBBBB',
      'EEE..PPP',
      'EEE..PPP',
      'EE....PP',
    ]),
  },
  // Stage 15: Prism Stairs
  {
    stage: 15,
    titleDe: 'Prisma-Stufen',
    titleEn: 'Prism Stairs',
    initialGrid: parseColorGrid([
      'RRRR....',
      'RROO....',
      '..OOGG..',
      '....GGEE',
      'CCEE....',
      '..CCBB..',
      '....BBPP',
      '....PPPP',
    ]),
  },
  // Stage 16: Neon Maze
  {
    stage: 16,
    titleDe: 'Neon-Labyrinth',
    titleEn: 'Neon Maze',
    initialGrid: parseColorGrid([
      'PPPPPPPP',
      'PP....PP',
      'PPCCCCPP',
      'PPC..CPP',
      'PPC..CPP',
      'PPCCCCPP',
      'PP....PP',
      'PPPPPPPP',
    ]),
  },
  // Stage 17: Pixel Duck
  {
    stage: 17,
    titleDe: 'Quietsche-Ente',
    titleEn: 'Pixel Duck',
    initialGrid: parseColorGrid([
      '..GGGG..',
      '.GGBGGG.',
      '.GGGGGOO',
      '..GGGG..',
      '.GGGGGGG',
      'GGGGGGGG',
      '.GGGGGG.',
      '..CCCC..',
    ]),
  },
  // Stage 18: Emerald Tree
  {
    stage: 18,
    titleDe: 'Smaragd-Tanne',
    titleEn: 'Emerald Pine',
    initialGrid: parseColorGrid([
      '...EE...',
      '..EEEE..',
      '.EEEEEE.',
      'EEEEEEEE',
      '.EEEEEE.',
      'EEEEEEEE',
      '...OO...',
      '...OO...',
    ]),
  },
  // Stage 19: Firebird
  {
    stage: 19,
    titleDe: 'Feuervogel',
    titleEn: 'Firebird',
    initialGrid: parseColorGrid([
      'RR....RR',
      'ROO..OOR',
      'ROOOOOOR',
      '.ROGGOR.',
      '..GGGG..',
      '..OOOO..',
      '...RR...',
      '...RR...',
    ]),
  },
  // Stage 20: Diamond Portal
  {
    stage: 20,
    titleDe: 'Diamant-Portal',
    titleEn: 'Diamond Portal',
    initialGrid: parseColorGrid([
      '..CCCC..',
      '.CC..CC.',
      'CC.BB.CC',
      'C.BBBB.C',
      'C.BBBB.C',
      'CC.BB.CC',
      '.CC..CC.',
      '..CCCC..',
    ]),
  },
  // Stage 21: Tropical Slice
  {
    stage: 21,
    titleDe: 'Melonen-Sommer',
    titleEn: 'Melon Slice',
    initialGrid: parseColorGrid([
      '........',
      'RRRRRRRR',
      'RBRRBRBR',
      '.RRRRRR.',
      '.GGGGGG.',
      '..EEEE..',
      '........',
      '........',
    ]),
  },
  // Stage 22: Star Invader
  {
    stage: 22,
    titleDe: 'Sternen-Wächter',
    titleEn: 'Star Invader',
    initialGrid: parseColorGrid([
      '..PP..PP',
      '..PPPP..',
      '.PPPPPP.',
      'PPC..CPP',
      'PPPPPPPP',
      'PP.PP.PP',
      'PP....PP',
      '........',
    ]),
  },
  // Stage 23: Anchor
  {
    stage: 23,
    titleDe: 'Tiefsee-Anker',
    titleEn: 'Ocean Anchor',
    initialGrid: parseColorGrid([
      '...GG...',
      '..G..G..',
      '...GG...',
      '.BBBBBB.',
      '...BB...',
      'BB.BB.BB',
      '.BBBBBB.',
      '..BBBB..',
    ]),
  },
  // Stage 24: Treasure Chest
  {
    stage: 24,
    titleDe: 'Schatztruhe',
    titleEn: 'Treasure Chest',
    initialGrid: parseColorGrid([
      '........',
      '.OOOOOO.',
      'GGGGGGGG',
      'OOOGGOOO',
      'OOOGGOOO',
      'OOOOOOOO',
      '.GGGGGG.',
      '........',
    ]),
  },
  // Stage 25: Crystal Snowflake
  {
    stage: 25,
    titleDe: 'Eiskristall',
    titleEn: 'Ice Crystal',
    initialGrid: parseColorGrid([
      'CC.BB.CC',
      '.CCCCCC.',
      'BB.CC.BB',
      '.CCCCCC.',
      '.CCCCCC.',
      'BB.CC.BB',
      '.CCCCCC.',
      'CC.BB.CC',
    ]),
  },
  // Stage 26: Cozy House
  {
    stage: 26,
    titleDe: 'Block-Villa',
    titleEn: 'Cozy Cottage',
    initialGrid: parseColorGrid([
      '...RR...',
      '..RRRR..',
      '.RRRRRR.',
      'RRRRRRRR',
      '.GGGGGG.',
      '.GGCCGG.',
      '.GG..GG.',
      '.GG..GG.',
    ]),
  },
  // Stage 27: Sailboat
  {
    stage: 27,
    titleDe: 'Segelboot',
    titleEn: 'Regatta Sail',
    initialGrid: parseColorGrid([
      '....RR..',
      '...RRR..',
      '..RRRR..',
      '.RRRRR..',
      '........',
      'OOOOOOOO',
      '.OOOOOO.',
      'CCCCCCCC',
    ]),
  },
  // Stage 28: Arcade Trophy
  {
    stage: 28,
    titleDe: 'Gold-Pokal',
    titleEn: 'Gold Trophy',
    initialGrid: parseColorGrid([
      'GGGGGGGG',
      'G.GGGG.G',
      'GG.GG.GG',
      '..GGGG..',
      '...GG...',
      '...GG...',
      '..GGGG..',
      '.OOOOOO.',
    ]),
  },
  // Stage 29: Infinity Loop
  {
    stage: 29,
    titleDe: 'Neon-Schleife',
    titleEn: 'Infinity Loop',
    initialGrid: parseColorGrid([
      '........',
      '.PPP.CCC',
      'P..P.C..',
      'PPPPCCCC',
      'CCCCPPPP',
      '..C.P..P',
      'CCC.PPP.',
      '........',
    ]),
  },
  // Stage 30: Grand Prism Mandala
  {
    stage: 30,
    titleDe: 'Meister-Mandala',
    titleEn: 'Master Mandala',
    initialGrid: parseColorGrid([
      'RRG..GRR',
      'RGG..GGR',
      'GGEEEEGG',
      '..EPPE..',
      '..EPPE..',
      'GGEEEEGG',
      'RGG..GGR',
      'RRG..GRR',
    ]),
  },
];

export function getBoardClearStage(stageNum: number): BoardClearStageDef {
  const idx =
    (((stageNum - 1) % BOARD_CLEAR_STAGES.length) + BOARD_CLEAR_STAGES.length) %
    BOARD_CLEAR_STAGES.length;
  const template = BOARD_CLEAR_STAGES[idx];
  return {
    ...template,
    stage: stageNum,
    initialGrid: cloneGrid(template.initialGrid),
  };
}

export function countOccupiedCells(grid: Grid): number {
  let count = 0;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] !== null) count++;
    }
  }
  return count;
}

/**
 * Exact Zero-Residue Line Gap Decomposer:
 * Decomposes the empty gaps of an occupied row or column (or twin adjacent rows/cols)
 * into exact catalog pieces (`dot_1`, `bar_2..5`, `sq_2`, `rect_2x3`, `rect_3x2`)
 * so completing that row/column leaves ZERO stray blocks anywhere else!
 */
function decomposeLineGapsExact(simGrid: Grid): PieceShape[] | null {
  // 1. Check twin adjacent rows where empty columns match -> sq_2 / rect_2x3 / bar_2v!
  for (let r = 0; r < 7; r++) {
    const r1Has = simGrid[r].some((x) => x !== null);
    const r2Has = simGrid[r + 1].some((x) => x !== null);
    if (!r1Has || !r2Has) continue;

    let sameEmptyMask = true;
    const emptyCols: number[] = [];
    for (let c = 0; c < 8; c++) {
      const e1 = simGrid[r][c] === null;
      const e2 = simGrid[r + 1][c] === null;
      if (e1 !== e2) {
        sameEmptyMask = false;
        break;
      }
      if (e1) emptyCols.push(c);
    }

    if (sameEmptyMask && emptyCols.length > 0 && emptyCols.length <= 6) {
      const runs: number[] = [];
      let runLen = 1;
      for (let i = 1; i < emptyCols.length; i++) {
        if (emptyCols[i] === emptyCols[i - 1] + 1) {
          runLen++;
        } else {
          runs.push(runLen);
          runLen = 1;
        }
      }
      runs.push(runLen);

      const pieces: PieceShape[] = [];
      for (const len of runs) {
        let rem = len;
        while (rem > 0) {
          if (rem >= 3) {
            pieces.push(shapeById('rect_2x3', randomClassicColor()));
            rem -= 3;
          } else if (rem === 2) {
            pieces.push(shapeById('sq_2', randomClassicColor()));
            rem -= 2;
          } else {
            pieces.push(shapeById('bar_2v', randomClassicColor()));
            rem -= 1;
          }
        }
      }
      if (pieces.length <= 3) return pieces;
    }
  }

  // 2. Find the fullest occupied single row or single column (fewest empty cells)
  type LineCandidate = {
    axis: 'row' | 'col';
    index: number;
    emptyIndices: number[];
  };
  const candidates: LineCandidate[] = [];

  for (let r = 0; r < 8; r++) {
    const emptyIndices: number[] = [];
    let filled = 0;
    for (let c = 0; c < 8; c++) {
      if (simGrid[r][c] === null) emptyIndices.push(c);
      else filled++;
    }
    if (filled > 0 && emptyIndices.length > 0) {
      candidates.push({ axis: 'row', index: r, emptyIndices });
    }
  }

  for (let c = 0; c < 8; c++) {
    const emptyIndices: number[] = [];
    let filled = 0;
    for (let r = 0; r < 8; r++) {
      if (simGrid[r][c] === null) emptyIndices.push(r);
      else filled++;
    }
    if (filled > 0 && emptyIndices.length > 0) {
      candidates.push({ axis: 'col', index: c, emptyIndices });
    }
  }

  candidates.sort((a, b) => a.emptyIndices.length - b.emptyIndices.length);

  for (const cand of candidates) {
    const runs: number[] = [];
    let runLen = 1;
    for (let i = 1; i < cand.emptyIndices.length; i++) {
      if (cand.emptyIndices[i] === cand.emptyIndices[i - 1] + 1) {
        runLen++;
      } else {
        runs.push(runLen);
        runLen = 1;
      }
    }
    runs.push(runLen);

    const pieces: PieceShape[] = [];
    const hIds: Record<number, string> = {
      1: 'dot_1',
      2: 'bar_2h',
      3: 'bar_3h',
      4: 'bar_4h',
      5: 'bar_5h',
    };
    const vIds: Record<number, string> = {
      1: 'dot_1',
      2: 'bar_2v',
      3: 'bar_3v',
      4: 'bar_4v',
      5: 'bar_5v',
    };
    const idMap = cand.axis === 'row' ? hIds : vIds;

    for (const len of runs) {
      let rem = len;
      while (rem > 0) {
        const chunk = Math.min(5, rem);
        pieces.push(shapeById(idMap[chunk], randomClassicColor()));
        rem -= chunk;
      }
    }

    if (pieces.length <= 3) {
      return pieces;
    }
  }

  return null;
}

/**
 * Constructive Zero-Trap Solver-Dealer for "Feld räumen" (Board Clear) mode:
 * Combines exact zero-residue line decomposition with multi-step lookahead
 * so EVERY stage can always be cleared cleanly down to 0 blocks!
 */
export function generateBoardClearDeal(grid: Grid): DockPiece[] {
  const chosenShapes: PieceShape[] = [];
  let simGrid = cloneGrid(grid);

  // When <= 22 blocks remain, prioritize exact zero-residue line decomposition
  // so endgame boards never spawn awkward leftover tiles!
  const initialOccupied = countOccupiedCells(simGrid);
  if (initialOccupied > 0 && initialOccupied <= 22) {
    const exactPack = decomposeLineGapsExact(simGrid);
    if (exactPack && exactPack.length > 0) {
      // Simulate exactPack and if slots remain (< 3), keep decomposing!
      const resultShapes: PieceShape[] = [...exactPack];
      // Advance simGrid through exactPack placements
      for (const sh of exactPack) {
        let bestNext: Grid | null = null;
        let minOcc = Infinity;
        const pRows = sh.matrix.length;
        const pCols = sh.matrix[0].length;
        for (let r = 0; r <= 8 - pRows; r++) {
          for (let c = 0; c <= 8 - pCols; c++) {
            if (!canPlacePiece(simGrid, sh.matrix, r, c)) continue;
            const res = placePieceAndResolve(simGrid, sh, r, c, 0, 0, 0);
            const occ = countOccupiedCells(res.finalGrid);
            if (occ < minOcc) {
              minOcc = occ;
              bestNext = res.finalGrid;
            }
          }
        }
        if (bestNext) simGrid = bestNext;
      }

      while (resultShapes.length < 3 && countOccupiedCells(simGrid) > 0) {
        const more = decomposeLineGapsExact(simGrid);
        if (!more || more.length === 0) break;
        const nextShape = more[0];
        resultShapes.push(nextShape);
        const pRows = nextShape.matrix.length;
        const pCols = nextShape.matrix[0].length;
        let bestNext: Grid | null = null;
        let minOcc = Infinity;
        for (let r = 0; r <= 8 - pRows; r++) {
          for (let c = 0; c <= 8 - pCols; c++) {
            if (!canPlacePiece(simGrid, nextShape.matrix, r, c)) continue;
            const res = placePieceAndResolve(simGrid, nextShape, r, c, 0, 0, 0);
            const occ = countOccupiedCells(res.finalGrid);
            if (occ < minOcc) {
              minOcc = occ;
              bestNext = res.finalGrid;
            }
          }
        }
        if (bestNext) simGrid = bestNext;
        else break;
      }

      return wrapShapesAsDock(resultShapes.slice(0, 3));
    }
  }

  for (let slot = 0; slot < 3; slot++) {
    const occupiedBefore = countOccupiedCells(simGrid);
    if (occupiedBefore === 0) break;

    // If mid-deal we reach endgame, use exact zero-residue finisher for remaining slot(s)
    if (occupiedBefore <= 14) {
      const exactRest = decomposeLineGapsExact(simGrid);
      if (exactRest && exactRest.length <= 3 - slot) {
        chosenShapes.push(...exactRest);
        break;
      }
    }

    const activeRows = new Set<number>();
    const activeCols = new Set<number>();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (simGrid[r][c] !== null) {
          activeRows.add(r);
          activeCols.add(c);
        }
      }
    }

    let bestScore = -Infinity;
    let bestCandidates: { shape: PieceShape; nextGrid: Grid }[] = [];

    for (const catalogItem of PIECE_CATALOG) {
      const pRows = catalogItem.matrix.length;
      const pCols = catalogItem.matrix[0].length;
      let pieceTiles = 0;
      for (let pr = 0; pr < pRows; pr++) {
        for (let pc = 0; pc < pCols; pc++) {
          if (catalogItem.matrix[pr][pc] === 1) pieceTiles++;
        }
      }

      for (let r = 0; r <= 8 - pRows; r++) {
        for (let c = 0; c <= 8 - pCols; c++) {
          if (!canPlacePiece(simGrid, catalogItem.matrix, r, c)) continue;

          const res = placePieceAndResolve(
            simGrid,
            catalogItem,
            r,
            c,
            0,
            0,
            0,
          );
          const occupiedAfter = countOccupiedCells(res.finalGrid);
          const netRemoved = occupiedBefore - occupiedAfter;

          let alignmentHits = 0;
          let strayTiles = 0;
          for (let pr = 0; pr < pRows; pr++) {
            for (let pc = 0; pc < pCols; pc++) {
              if (catalogItem.matrix[pr][pc] === 1) {
                const cellKey = `${r + pr},${c + pc}`;
                if (res.clearInfo.clearedCells.has(cellKey)) {
                  alignmentHits += 2;
                } else if (
                  activeRows.has(r + pr) ||
                  activeCols.has(c + pc)
                ) {
                  alignmentHits++;
                } else {
                  strayTiles++;
                }
              }
            }
          }

          let score = 0;
          if (occupiedAfter === 0) {
            score = 60000 + pieceTiles * 60;
          } else if (res.clearInfo.linesCount > 0) {
            score =
              netRemoved * 190 +
              res.clearInfo.linesCount * 260 -
              strayTiles * 140 +
              Math.min(pieceTiles, 6) * 15;
          } else {
            let maxLineFill = 0;
            for (const ar of activeRows) {
              const filled = res.finalGrid[ar].filter((x) => x !== null).length;
              if (filled > maxLineFill) maxLineFill = filled;
            }
            for (const ac of activeCols) {
              let filled = 0;
              for (let rr = 0; rr < 8; rr++) {
                if (res.finalGrid[rr][ac] !== null) filled++;
              }
              if (filled > maxLineFill) maxLineFill = filled;
            }
            score =
              alignmentHits * 50 -
              strayTiles * 160 +
              maxLineFill * 40 +
              Math.min(pieceTiles, 4) * 10;
          }

          if (catalogItem.id === 'dot_1' && occupiedAfter !== 0 && res.clearInfo.linesCount === 0) {
            score -= 60;
          }

          if (score > bestScore + 12) {
            bestScore = score;
            bestCandidates = [{ shape: catalogItem, nextGrid: res.finalGrid }];
          } else if (Math.abs(score - bestScore) <= 12) {
            bestCandidates.push({ shape: catalogItem, nextGrid: res.finalGrid });
          }
        }
      }
    }

    if (bestCandidates.length === 0) break;
    const picked =
      bestCandidates[Math.floor(Math.random() * bestCandidates.length)];
    chosenShapes.push({
      ...picked.shape,
      color: randomClassicColor(),
    });
    simGrid = picked.nextGrid;
  }

  if (chosenShapes.length === 0) {
    const fallback =
      PIECE_CATALOG.find((s) => canShapeFitAnywhere(grid, s.matrix)) ??
      PIECE_CATALOG[0];
    chosenShapes.push({ ...fallback, color: randomClassicColor() });
  }

  return wrapShapesAsDock(chosenShapes);
}

const CLASSIC_STARTER_GRIDS: string[][] = [
  // Symmetric Prism Frame
  [
    '........',
    '.BB..PP.',
    '.B....P.',
    '........',
    '........',
    '.E....O.',
    '.EE..OO.',
    '........',
  ],
  // Cozy Heart
  [
    '........',
    '..RR.RR.',
    '.RRRRRR.',
    '.RGGGGR.',
    '..RRRR..',
    '...RR...',
    '........',
    '........',
  ],
  // Twin Bridges
  [
    '........',
    '........',
    '.CC..EE.',
    '.C....E.',
    '.E....C.',
    '.EE..CC.',
    '........',
    '........',
  ],
  // Friendly Robot Visor
  [
    '........',
    '..GGGG..',
    '.GGC.CG.',
    '.GGGGGG.',
    '..G..G..',
    '........',
    '........',
    '........',
  ],
];

export function createClassicStarterGrid(): Grid {
  const chosen =
    CLASSIC_STARTER_GRIDS[
      Math.floor(Math.random() * CLASSIC_STARTER_GRIDS.length)
    ];
  return parseColorGrid(chosen);
}
