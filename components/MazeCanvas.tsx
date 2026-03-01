"use client";

import { useEffect, useRef } from "react";
import type { Maze } from "@/lib/maze";

interface Props {
  maze: Maze;
  player: { x: number; y: number };
  solution: Array<{ x: number; y: number }> | null;
  showSolution: boolean;
  won: boolean;
}

const COLORS = {
  bg: "#0f0f1a",
  wall: "#0f3460",
  wallGlow: "#1a5a9a",
  path: "#13132a",
  visited: "#1a1a35",
  solution: "rgba(255, 200, 0, 0.25)",
  solutionLine: "rgba(255, 200, 0, 0.6)",
  start: "#39ff14",
  startGlow: "rgba(57, 255, 20, 0.4)",
  end: "#ff4500",
  endGlow: "rgba(255, 69, 0, 0.5)",
  player: "#00d4ff",
  playerGlow: "rgba(0, 212, 255, 0.6)",
  playerInner: "#ffffff",
};

export default function MazeCanvas({
  maze,
  player,
  solution,
  showSolution,
  won,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = (time: number) => {
      timeRef.current = time;
      const t = time / 1000;

      const dpr = window.devicePixelRatio || 1;
      const container = canvas.parentElement!;
      const containerW = container.clientWidth;
      const containerH = container.clientHeight;

      const cellSize = Math.floor(
        Math.min(containerW / maze.width, containerH / maze.height)
      );
      const totalW = cellSize * maze.width;
      const totalH = cellSize * maze.height;
      const offsetX = Math.floor((containerW - totalW) / 2);
      const offsetY = Math.floor((containerH - totalH) / 2);

      if (canvas.width !== containerW * dpr || canvas.height !== containerH * dpr) {
        canvas.width = containerW * dpr;
        canvas.height = containerH * dpr;
        canvas.style.width = containerW + "px";
        canvas.style.height = containerH + "px";
        ctx.scale(dpr, dpr);
      }

      // Background
      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(0, 0, containerW, containerH);

      // Solution path
      if (showSolution && solution && solution.length > 0) {
        ctx.fillStyle = COLORS.solution;
        for (const p of solution) {
          ctx.fillRect(
            offsetX + p.x * cellSize + 2,
            offsetY + p.y * cellSize + 2,
            cellSize - 4,
            cellSize - 4
          );
        }
        ctx.strokeStyle = COLORS.solutionLine;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        solution.forEach((p, i) => {
          const cx = offsetX + p.x * cellSize + cellSize / 2;
          const cy = offsetY + p.y * cellSize + cellSize / 2;
          if (i === 0) ctx.moveTo(cx, cy);
          else ctx.lineTo(cx, cy);
        });
        ctx.stroke();
      }

      const wallW = Math.max(1, Math.round(cellSize * 0.08));

      // Draw cells
      for (let y = 0; y < maze.height; y++) {
        for (let x = 0; x < maze.width; x++) {
          const cell = maze.grid[y][x];
          const cx = offsetX + x * cellSize;
          const cy = offsetY + y * cellSize;

          ctx.strokeStyle = COLORS.wall;
          ctx.lineWidth = wallW;
          ctx.lineCap = "square";

          if (cell.walls.top) {
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + cellSize, cy);
            ctx.stroke();
          }
          if (cell.walls.right) {
            ctx.beginPath();
            ctx.moveTo(cx + cellSize, cy);
            ctx.lineTo(cx + cellSize, cy + cellSize);
            ctx.stroke();
          }
          if (cell.walls.bottom) {
            ctx.beginPath();
            ctx.moveTo(cx, cy + cellSize);
            ctx.lineTo(cx + cellSize, cy + cellSize);
            ctx.stroke();
          }
          if (cell.walls.left) {
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx, cy + cellSize);
            ctx.stroke();
          }
        }
      }

      // Start marker
      {
        const sx = offsetX + maze.start.x * cellSize + cellSize / 2;
        const sy = offsetY + maze.start.y * cellSize + cellSize / 2;
        const r = cellSize * 0.28;
        const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
        grd.addColorStop(0, "rgba(57, 255, 20, 0.9)");
        grd.addColorStop(1, "rgba(57, 255, 20, 0)");
        ctx.beginPath();
        ctx.arc(sx, sy, r * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sx, sy, r * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.start;
        ctx.fill();
      }

      // End marker (pulsing)
      {
        const pulse = 0.85 + 0.15 * Math.sin(t * 3);
        const ex = offsetX + maze.end.x * cellSize + cellSize / 2;
        const ey = offsetY + maze.end.y * cellSize + cellSize / 2;
        const r = cellSize * 0.3 * pulse;
        const grd = ctx.createRadialGradient(ex, ey, 0, ex, ey, r * 2.5);
        grd.addColorStop(0, "rgba(255,69,0,0.9)");
        grd.addColorStop(0.5, "rgba(255,69,0,0.3)");
        grd.addColorStop(1, "rgba(255,69,0,0)");
        ctx.beginPath();
        ctx.arc(ex, ey, r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ex, ey, r, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.end;
        ctx.fill();
      }

      // Player
      if (!won) {
        const pulse = 0.9 + 0.1 * Math.sin(t * 4);
        const px = offsetX + player.x * cellSize + cellSize / 2;
        const py = offsetY + player.y * cellSize + cellSize / 2;
        const r = cellSize * 0.32 * pulse;

        const grd = ctx.createRadialGradient(px, py, 0, px, py, r * 2.5);
        grd.addColorStop(0, "rgba(0,212,255,0.8)");
        grd.addColorStop(0.6, "rgba(0,212,255,0.2)");
        grd.addColorStop(1, "rgba(0,212,255,0)");
        ctx.beginPath();
        ctx.arc(px, py, r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.player;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px - r * 0.25, py - r * 0.25, r * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [maze, player, solution, showSolution, won]);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
