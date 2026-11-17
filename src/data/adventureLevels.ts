import type { AdventureLevelDef, ColorId, GemType, Grid } from '../types/game';
import { CLASSIC_COLORS } from './pieces';

const ALL_GEMS: GemType[] = [
  'diamond_blue',
  'emerald_green',
  'star_orange',
  'ruby_red',
  'amethyst_purple',
];

/**
 * 16 spacious, blast-friendly 8x8 Adventure templates:
 * '.' = empty, 'B' = colorful base block, 'G' = gem block (or colorful block in score levels).
 * Every pattern leaves wide 3x3 / 4x4 open landing areas AND contiguous rows/cols
 * that reward smart line clears right from turn 1 (zero diagonal checkerboard traps!).
 */
const PATTERN_TEMPLATES: string[][] = [
  // 0: Open frame center (Level 1)
  [
    '........',
    '..BBBB..',
    '..B..B..',
    '........',
    '........',
    '..B..B..',
    '..BBBB..',
    '........',
  ],
  // 1: Twin horizontal gem bands (Level 2)
  [
    '........',
    '.BGGGGB.',
    '........',
    '........',
    '........',
    '........',
    '.BGGGGB.',
    '........',
  ],
  // 2: Cozy 4-corner 2x2 clusters (Level 3)
  [
    '........',
    '.GG..GG.',
    '.GB..BG.',
    '........',
    '........',
    '.GB..BG.',
    '.GG..GG.',
    '........',
  ],
  // 3: Parallel vertical columns with wide 4-col center (Level 4)
  [
    '........',
    '.G....G.',
    '.B....B.',
    '.G....G.',
    '.G....G.',
    '.B....B.',
    '.G....G.',
    '........',
  ],
  // 4: Level 5 — Spacious Twin Bridges (easy 2-cell & 4-cell line completions!)
  [
    '........',
    'BB.GG.BB',
    '........',
    '..GGGG..',
    '..GGGG..',
    '........',
    'BB.GG.BB',
    '........',
  ],
  // 5: Inner 2x4 island + outer edge pairs
  [
    '...GG...',
    '........',
    '..BBBB..',
    '..GGGG..',
    '..GGGG..',
    '..BBBB..',
    '........',
    '...GG...',
  ],
  // 6: L-Corners leaving a huge 6x6 central arena
  [
    'GGB.....',
    'GB......',
    'B.......',
    '........',
    '........',
    '.......B',
    '......BG',
    '.....BGG',
  ],
  // 7: Symmetric L-Corners (all 4 corners, huge 4x4 + cross center)
  [
    'GG....GG',
    'GB....BG',
    '........',
    '........',
    '........',
    '........',
    'GB....BG',
    'GG....GG',
  ],
  // 8: Triple horizontal steps (1-move row clears ready!)
  [
    '........',
    'BBB..GGG',
    '........',
    'GGG..BBB',
    '........',
    'BBB..GGG',
    '........',
    '........',
  ],
  // 9: Center 4x4 hollow courtyard
  [
    '........',
    '........',
    '..GGBB..',
    '..G..B..',
    '..B..G..',
    '..BBGG..',
    '........',
    '........',
  ],
  // 10: Wide Harbour Gates
  [
    '.GGBBGG.',
    '.G....G.',
    '........',
    '........',
    '........',
    '........',
    '.G....G.',
    '.GGBBGG.',
  ],
  // 11: Twin Pillars
  [
    '..G..G..',
    '..B..B..',
    '..G..G..',
    '........',
    '........',
    '..G..G..',
    '..B..B..',
    '..G..G..',
  ],
  // 12: Sunburst Cross
  [
    '...BB...',
    '...GG...',
    '........',
    'BG....GB',
    'BG....GB',
    '........',
    '...GG...',
    '...BB...',
  ],
  // 13: Stepping Blocks (2x2 friendly)
  [
    'GG......',
    'BB......',
    '..GG....',
    '..BB....',
    '....GG..',
    '....BB..',
    '......GG',
    '......BB',
  ],
  // 14: Crown Arch
  [
    '........',
    '.GGGGGG.',
    '.BB..BB.',
    '........',
    '........',
    '.BB..BB.',
    '.GGGGGG.',
    '........',
  ],
  // 15: Royal Vault
  [
    '........',
    '..GGGG..',
    '.BB..BB.',
    '.G....G.',
    '.G....G.',
    '.BB..BB.',
    '..GGGG..',
    '........',
  ],
];

function buildGridFromPattern(
  patternIdx: number,
  levelType: 'score' | 'collect',
  gemTypes: GemType[],
  seed: number,
): Grid {
  const tpl = PATTERN_TEMPLATES[patternIdx % PATTERN_TEMPLATES.length];
  let gemCounter = seed;

  return tpl.map((rowStr, rIdx) => {
    const rowColor: ColorId =
      CLASSIC_COLORS[(seed + rIdx) % CLASSIC_COLORS.length];
    const altColor: ColorId =
      CLASSIC_COLORS[(seed + rIdx + 3) % CLASSIC_COLORS.length];

    return rowStr.split('').map((ch, cIdx) => {
      if (ch === '.') return null;
      if (levelType === 'score' || ch === 'B' || gemTypes.length === 0) {
        return { color: cIdx < 4 ? rowColor : altColor };
      }
      const gem = gemTypes[gemCounter % gemTypes.length];
      gemCounter++;
      return { color: 'stone' as const, gem };
    });
  });
}

export const TOTAL_ADVENTURE_LEVELS = 96;

function createLevelDef(levelNum: number): AdventureLevelDef {
  // Hand-crafted opening Levels 1–6 for an effortless, rewarding onboarding curve
  if (levelNum === 1) {
    return {
      level: 1,
      type: 'score',
      targetScore: 300,
      initialGrid: buildGridFromPattern(0, 'score', [], 1),
    };
  }

  if (levelNum === 2) {
    return {
      level: 2,
      type: 'collect',
      targets: { emerald_green: 10 },
      initialGrid: buildGridFromPattern(1, 'collect', ['emerald_green'], 2),
    };
  }

  if (levelNum === 3) {
    return {
      level: 3,
      type: 'collect',
      targets: { ruby_red: 7, amethyst_purple: 7 },
      initialGrid: buildGridFromPattern(
        2,
        'collect',
        ['ruby_red', 'amethyst_purple'],
        3,
      ),
    };
  }

  if (levelNum === 4) {
    return {
      level: 4,
      type: 'score',
      targetScore: 450,
      initialGrid: buildGridFromPattern(3, 'score', [], 4),
    };
  }

  if (levelNum === 5) {
    return {
      level: 5,
      type: 'collect',
      targets: { diamond_blue: 6, emerald_green: 6, star_orange: 6 },
      initialGrid: buildGridFromPattern(
        4,
        'collect',
        ['diamond_blue', 'emerald_green', 'star_orange'],
        5,
      ),
    };
  }

  if (levelNum === 6) {
    return {
      level: 6,
      type: 'score',
      targetScore: 580,
      initialGrid: buildGridFromPattern(5, 'score', [], 6),
    };
  }

  // Alternating rhythm across Levels 7..96:
  // Every 3rd level (and summit Level 95) is a vibrant Score Blast level;
  // all others (including Grand Finale Level 96) are Gem Collection levels!
  const isScoreLevel = levelNum !== 96 && (levelNum % 3 === 0 || levelNum === 10 || levelNum === 95);

  if (isScoreLevel) {
    // Smooth curve from ~650 at Level 9 up to ~3,400 at Level 95
    const rawTarget = 420 + levelNum * 31;
    const targetScore = Math.round(rawTarget / 10) * 10;
    return {
      level: levelNum,
      type: 'score',
      targetScore,
      initialGrid: buildGridFromPattern(levelNum, 'score', [], levelNum),
    };
  }

  // Balanced Gem Collection levels (total gems scale gently from 16 up to 42 at Level 96)
  const gemCountTypes =
    levelNum <= 14 ? 2 : levelNum <= 38 ? 3 : levelNum <= 70 ? 4 : 5;

  const chosenGems: GemType[] = [];
  for (let i = 0; i < gemCountTypes; i++) {
    chosenGems.push(ALL_GEMS[(levelNum + i) % ALL_GEMS.length]);
  }

  const totalGemsTarget = Math.min(
    44,
    14 + Math.floor((levelNum / TOTAL_ADVENTURE_LEVELS) * 28),
  );
  const perGemBase = Math.max(4, Math.floor(totalGemsTarget / gemCountTypes));
  const remainder = totalGemsTarget - perGemBase * gemCountTypes;

  const targets: Partial<Record<GemType, number>> = {};
  chosenGems.forEach((g, idx) => {
    targets[g] = perGemBase + (idx < remainder ? 1 : 0);
  });

  return {
    level: levelNum,
    type: 'collect',
    targets,
    initialGrid: buildGridFromPattern(levelNum, 'collect', chosenGems, levelNum),
  };
}

export const ADVENTURE_LEVELS: AdventureLevelDef[] = Array.from(
  { length: TOTAL_ADVENTURE_LEVELS },
  (_, idx) => createLevelDef(idx + 1),
);

export function getAdventureLevel(levelNum: number): AdventureLevelDef {
  const clamped = Math.max(1, Math.min(TOTAL_ADVENTURE_LEVELS, levelNum));
  return ADVENTURE_LEVELS[clamped - 1];
}
