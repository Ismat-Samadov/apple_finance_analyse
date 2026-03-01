# MazeGen — Procedural Maze Generator

A fast, beautiful maze game built with **Next.js 16**, **TypeScript**, and **Canvas**. Mazes are procedurally generated using classic algorithms, rendered with smooth animations, and fully playable on desktop and mobile.

## Features

- **Two generation algorithms**
  - **DFS (Depth-First Search)** — long winding corridors, one clear solution path
  - **Prim's Algorithm** — more branching, wider open passages
- **4 maze sizes** — Small (10×10) → XL (40×40)
- **Animated canvas renderer** — pulsing end marker, glowing player, solution path overlay
- **Full input support**
  - ⌨️ Keyboard: Arrow keys or WASD
  - 👆 Touch: Swipe in any direction
  - 🕹️ On-screen D-pad (mobile)
- **Game stats** — live timer, move counter, best time per size/algorithm
- **BFS hint system** — reveal the solution path on demand
- **Win screen** with time + moves summary and new-best detection
- **Fully responsive** — works on any screen size, uses `100dvh` for mobile

## Tech Stack

| Tool | Purpose |
|------|---------|
| Next.js 16 (App Router) | Framework |
| React 19 | UI |
| TypeScript | Type safety |
| Tailwind CSS 3 | Styling |
| HTML Canvas API | Maze rendering |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
# Production build
npm run build
npm start
```

## Project Structure

```
maze_generator/
├── app/
│   ├── layout.tsx       # Root layout, metadata, viewport
│   ├── page.tsx         # Home page
│   ├── globals.css      # Tailwind base + global styles
│   └── icon.svg         # SVG favicon
├── components/
│   ├── MazeGame.tsx     # Game logic, controls, timer, win state
│   └── MazeCanvas.tsx   # Animated canvas renderer
├── lib/
│   └── maze.ts          # DFS, Prim's, BFS solver
├── tailwind.config.ts
├── next.config.ts
└── tsconfig.json
```

## Algorithms

### DFS (Depth-First Search)
Carves a maze by recursively visiting unvisited neighbors in a random order. Produces long, winding corridors with a low branching factor and tends to have one obvious solution path.

### Prim's Algorithm
Grows the maze from a random starting cell by maintaining a frontier of candidate walls. Picks randomly from the frontier at each step, producing a more uniform tree with wider branching.

### BFS Solver
The hint system uses breadth-first search to find the shortest path from start to end, visualized as a yellow overlay on the canvas.

## Controls

| Action | Keys |
|--------|------|
| Move Up | `↑` or `W` |
| Move Down | `↓` or `S` |
| Move Left | `←` or `A` |
| Move Right | `→` or `D` |
| Mobile | Swipe or D-pad |

## License

MIT
