"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Algorithm, Maze } from "@/lib/maze";
import { generateMaze, solveMaze } from "@/lib/maze";
import MazeCanvas from "./MazeCanvas";

const SIZES = [
  { label: "Small", value: 10 },
  { label: "Medium", value: 18 },
  { label: "Large", value: 28 },
  { label: "XL", value: 40 },
];

type Direction = "top" | "right" | "bottom" | "left";

const DIR_MAP: Record<string, Direction> = {
  ArrowUp: "top", w: "top", W: "top",
  ArrowDown: "bottom", s: "bottom", S: "bottom",
  ArrowLeft: "left", a: "left", A: "left",
  ArrowRight: "right", d: "right", D: "right",
};

const DELTA: Record<Direction, { dx: number; dy: number }> = {
  top: { dx: 0, dy: -1 },
  right: { dx: 1, dy: 0 },
  bottom: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
};

export default function MazeGame() {
  const [algorithm, setAlgorithm] = useState<Algorithm>("dfs");
  const [sizeIdx, setSizeIdx] = useState(1);
  const [maze, setMaze] = useState<Maze | null>(null);
  const [player, setPlayer] = useState({ x: 0, y: 0 });
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [solution, setSolution] = useState<Array<{ x: number; y: number }> | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [bestTimes, setBestTimes] = useState<Record<string, number>>({});

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const newGame = useCallback(() => {
    const size = SIZES[sizeIdx].value;
    const m = generateMaze(size, size, algorithm);
    setMaze(m);
    setPlayer(m.start);
    setMoves(0);
    setWon(false);
    setShowSolution(false);
    setSolution(null);
    setStartTime(Date.now());
    setElapsed(0);
    setTimerRunning(true);
  }, [algorithm, sizeIdx]);

  // Init
  useEffect(() => {
    newGame();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (timerRunning && !won) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 500);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning, won, startTime]);

  const tryMove = useCallback(
    (dir: Direction) => {
      if (!maze || won) return;
      const { dx, dy } = DELTA[dir];
      setPlayer(prev => {
        const cell = maze.grid[prev.y][prev.x];
        if (cell.walls[dir]) return prev;
        const next = { x: prev.x + dx, y: prev.y + dy };
        if (
          next.x < 0 || next.x >= maze.width ||
          next.y < 0 || next.y >= maze.height
        ) return prev;
        setMoves(m => m + 1);
        if (next.x === maze.end.x && next.y === maze.end.y) {
          setWon(true);
          setTimerRunning(false);
          const key = `${SIZES[sizeIdx].label}-${algorithm}`;
          setBestTimes(prev2 => {
            const current = elapsed + Math.floor((Date.now() - startTime) / 1000);
            const best = prev2[key];
            if (best === undefined || current < best) {
              return { ...prev2, [key]: current };
            }
            return prev2;
          });
        }
        return next;
      });
    },
    [maze, won, sizeIdx, algorithm, elapsed, startTime]
  );

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const dir = DIR_MAP[e.key];
      if (dir) {
        e.preventDefault();
        tryMove(dir);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [tryMove]);

  // Touch
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartRef.current.x;
      const dy = t.clientY - touchStartRef.current.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      const threshold = 20;
      if (absDx < threshold && absDy < threshold) return;
      if (absDx > absDy) {
        tryMove(dx > 0 ? "right" : "left");
      } else {
        tryMove(dy > 0 ? "bottom" : "top");
      }
      touchStartRef.current = null;
    },
    [tryMove]
  );

  const handleShowSolution = () => {
    if (!maze) return;
    if (!solution) setSolution(solveMaze(maze));
    setShowSolution(v => !v);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const bestKey = `${SIZES[sizeIdx].label}-${algorithm}`;
  const best = bestTimes[bestKey];

  return (
    <div className="flex flex-col h-dvh bg-maze-bg text-white overflow-hidden">
      {/* Header */}
      <header className="flex-none px-4 pt-4 pb-2">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-maze-accent flex items-center justify-center shadow-lg shadow-maze-accent/30">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3h4v4H3zM17 3h4v4h-4zM3 17h4v4H3z" fill="white" opacity="0.9"/>
                  <path d="M7 5h10M5 7v10M19 7v10M7 19h4M13 19h4M12 12h4M8 12v4M8 8v2M12 8h4M12 12v-4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight leading-none">
                  Maze<span className="text-maze-accent">Gen</span>
                </h1>
                <p className="text-xs text-white/40 leading-none mt-0.5">Procedural Maze Generator</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-maze-surface border border-maze-border/50">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-maze-player">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span className="text-sm font-mono text-white/80 tabular-nums">
                  {formatTime(elapsed)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-maze-surface border border-maze-border/50">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-maze-accent">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
                <span className="text-sm font-mono text-white/80 tabular-nums">{moves}</span>
              </div>
              {best !== undefined && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-maze-surface border border-maze-border/50">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-400">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  <span className="text-sm font-mono text-white/80 tabular-nums">{formatTime(best)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="flex-none px-4 pb-2">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-2 items-center">
            {/* Algorithm */}
            <div className="flex rounded-lg overflow-hidden border border-maze-border/50 bg-maze-surface">
              {(["dfs", "prims"] as Algorithm[]).map(alg => (
                <button
                  key={alg}
                  onClick={() => setAlgorithm(alg)}
                  className={`px-3 py-1.5 text-xs font-medium transition-all ${
                    algorithm === alg
                      ? "bg-maze-accent text-white shadow-inner"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {alg === "dfs" ? "DFS" : "Prim's"}
                </button>
              ))}
            </div>

            {/* Size */}
            <div className="flex rounded-lg overflow-hidden border border-maze-border/50 bg-maze-surface">
              {SIZES.map((s, i) => (
                <button
                  key={s.label}
                  onClick={() => setSizeIdx(i)}
                  className={`px-3 py-1.5 text-xs font-medium transition-all ${
                    sizeIdx === i
                      ? "bg-maze-accent2 text-white shadow-inner"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Actions */}
            <button
              onClick={newGame}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-maze-player/20 border border-maze-player/40 text-maze-player text-xs font-medium hover:bg-maze-player/30 active:scale-95 transition-all"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/>
              </svg>
              New Maze
            </button>

            <button
              onClick={handleShowSolution}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium active:scale-95 transition-all ${
                showSolution
                  ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-400"
                  : "bg-maze-surface border-maze-border/50 text-white/50 hover:text-white/80"
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              {showSolution ? "Hide" : "Hint"}
            </button>
          </div>
        </div>
      </div>

      {/* Maze Canvas */}
      <div
        className="flex-1 min-h-0 px-4 pb-2"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="max-w-5xl mx-auto h-full">
          <div className="relative h-full rounded-xl overflow-hidden border border-maze-border/50 bg-maze-bg shadow-2xl shadow-black/50">
            {maze && (
              <MazeCanvas
                maze={maze}
                player={player}
                solution={solution}
                showSolution={showSolution}
                won={won}
              />
            )}

            {/* Legend overlay */}
            <div className="absolute bottom-2 left-2 flex items-center gap-3 px-2.5 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 text-xs text-white/50">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-400 shadow-sm shadow-green-400/60"/>
                Start
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/60"/>
                End
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/60"/>
                You
              </span>
            </div>

            {/* Win overlay */}
            {won && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                <div className="text-center px-8 py-6 rounded-2xl bg-maze-surface border border-maze-accent/40 shadow-2xl shadow-maze-accent/20 max-w-xs mx-4">
                  <div className="text-4xl mb-2 animate-bounce">🎉</div>
                  <h2 className="text-2xl font-bold text-white mb-1">You Escaped!</h2>
                  <p className="text-white/50 text-sm mb-4">
                    Solved in <span className="text-maze-player font-semibold">{formatTime(elapsed)}</span> with{" "}
                    <span className="text-maze-accent font-semibold">{moves}</span> moves
                  </p>
                  {best !== undefined && elapsed <= best && (
                    <p className="text-yellow-400 text-xs mb-3 font-medium">New Best Time! ⭐</p>
                  )}
                  <button
                    onClick={newGame}
                    className="w-full px-4 py-2 rounded-lg bg-maze-accent text-white font-semibold text-sm hover:bg-maze-accent/90 active:scale-95 transition-all shadow-lg shadow-maze-accent/30"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile D-pad */}
      <div className="flex-none px-4 pb-4 flex justify-center md:hidden">
        <div className="grid grid-cols-3 grid-rows-3 gap-1.5 w-36 h-36">
          <div/>
          <button
            onPointerDown={() => tryMove("top")}
            className="flex items-center justify-center rounded-lg bg-maze-surface border border-maze-border/60 text-white/70 active:bg-maze-accent active:text-white active:scale-95 transition-all touch-none select-none"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"/>
            </svg>
          </button>
          <div/>
          <button
            onPointerDown={() => tryMove("left")}
            className="flex items-center justify-center rounded-lg bg-maze-surface border border-maze-border/60 text-white/70 active:bg-maze-accent active:text-white active:scale-95 transition-all touch-none select-none"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div className="flex items-center justify-center rounded-lg bg-maze-surface/50 border border-maze-border/30">
            <div className="w-2 h-2 rounded-full bg-maze-player/50"/>
          </div>
          <button
            onPointerDown={() => tryMove("right")}
            className="flex items-center justify-center rounded-lg bg-maze-surface border border-maze-border/60 text-white/70 active:bg-maze-accent active:text-white active:scale-95 transition-all touch-none select-none"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
          <div/>
          <button
            onPointerDown={() => tryMove("bottom")}
            className="flex items-center justify-center rounded-lg bg-maze-surface border border-maze-border/60 text-white/70 active:bg-maze-accent active:text-white active:scale-95 transition-all touch-none select-none"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <div/>
        </div>
      </div>

      {/* Footer hint */}
      <div className="flex-none hidden md:block text-center pb-3">
        <p className="text-xs text-white/20">
          Arrow keys or WASD to move &middot; Swipe on mobile
        </p>
      </div>
    </div>
  );
}
