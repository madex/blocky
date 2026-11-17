<div align="center">

# Blocky

**A mobile-first block puzzle game — four modes, 126 handcrafted challenges, no backend required.**

[▶ Play now](https://madex.github.io/blocky) · [Report an issue](https://github.com/madex/blocky/issues)

</div>

---

## What is Blocky?

Blocky is a browser-based block puzzle game inspired by *Block Blast* and *Waudoku*. Drag polyomino pieces onto an 8×8 grid, fill rows and columns to clear them, and chase combos without ever running out of space.

It ships as a pure static web app: no server, no account, no API key. All progress and high scores live in your browser's `localStorage`, so you can install it to your home screen and keep playing offline.

**Play it here: <https://madex.github.io/blocky>**

## Game modes

| Mode | Board | What you do |
| --- | --- | --- |
| **Adventure** | 8×8 | Climb a 96-level pyramid. Each level has a target score or gem goal to unlock the next one. |
| **Clear the Board** | 8×8 | 30 puzzle stages start pre-filled with colorful figures. Wipe the board down to exactly 0 blocks. |
| **Classic** | 8×8 | Endless high-score chase with a Combo Heart multiplier and a +300 bonus for a completely empty board. |
| **Tempo Drop** | 8×8 | Blocks fall from above Blocksturz-style. Clearing lines buys you time as the speed keeps rising. |

## Features

- **No install, no sign-up** — open the URL and play.
- **Fully offline capable** — a PWA manifest and local assets mean it works without a network once loaded.
- **Progress saved automatically** — adventure levels, puzzle stages, personal bests and even an interrupted classic run.
- **Bilingual** — German and English, switchable at any time.
- **Responsive & touch-first** — built for one-handed play on a phone, equally fine with a mouse on desktop.
- **Sound effects** with a mute toggle, generated in the browser (no audio downloads).
- **Undo** in Clear the Board puzzles, plus pause and resume in Tempo Drop.
- **Zero tracking** — no analytics, no third-party requests, no cookies.

## Build and run locally

**Prerequisites:** [Node.js](https://nodejs.org/) 20 or newer and npm.

```bash
# 1. Clone the repository
git clone git@github.com:madex/blocky.git
cd blocky

# 2. Install dependencies
npm install

# 3. Start the dev server (http://localhost:3000)
npm run dev
```

### Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite with hot reload on port `3000`, exposed on your LAN for phone testing. |
| `npm run build` | Type-check-free production build into `dist/`. |
| `npm run preview` | Serve the built `dist/` folder locally to verify the production output. |
| `npm run lint` | Run the TypeScript compiler in `--noEmit` mode. |
| `npm run clean` | Remove `dist/` and build leftovers. |

## Deploying to GitHub Pages

The Vite config uses a relative `base` (`./`), so the same build works at a repository subpath like `/blocky/` without any extra configuration.

```bash
npm run build
# then publish the contents of dist/ to the gh-pages branch, e.g.
npx gh-pages -d dist
```

Then point the repository's **Settings → Pages** source at the `gh-pages` branch. Any other static host (Netlify, Vercel, Cloudflare Pages, an nginx directory) works the same way — just upload `dist/`.

## Tech stack

- **[React 19](https://react.dev/)** + **[TypeScript](https://www.typescriptlang.org/)** for the UI
- **[Vite 8](https://vite.dev/)** for dev server and bundling
- **[Tailwind CSS 4](https://tailwindcss.com/)** for styling
- **[Motion](https://motion.dev/)** for animations and **[lucide-react](https://lucide.dev/)** for icons
- **[Web Audio API](https://developer.mozilla.org/docs/Web/API/Web_Audio_API)** for procedurally generated sound

## Project structure

```
.
├── index.html                  # Entry point, PWA meta tags
├── public/
│   ├── blocky-icon.webp        # App icon
│   └── manifest.webmanifest    # PWA manifest
└── src/
    ├── App.tsx                 # App shell, mode routing, persistence
    ├── components/             # Board, piece dock, modals, adventure map, tempo mode
    ├── data/
    │   ├── pieces.ts           # Piece catalog and color palette
    │   ├── adventureLevels.ts  # 96 adventure level definitions
    │   └── boardClearPuzzles.ts# 30 clear-the-board stages
    ├── types/game.ts           # Shared types
    └── utils/
        ├── gameLogic.ts        # Placement, clears, scoring, piece generation
        ├── i18n.ts             # German/English copy
        └── sound.ts            # Web Audio effects
```

## Privacy

Blocky is entirely client-side. Nothing is uploaded anywhere: scores, unlocks and settings are stored only in your own browser, and you can withdraw storage consent at any time from the in-game privacy dialog, which clears the stored data.

## License

[MIT](LICENSE) © Martin Boekhoff
