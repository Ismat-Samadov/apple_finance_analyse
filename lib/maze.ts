export type Cell = {
  x: number;
  y: number;
  walls: { top: boolean; right: boolean; bottom: boolean; left: boolean };
  visited: boolean;
};

export type Maze = {
  grid: Cell[][];
  width: number;
  height: number;
  start: { x: number; y: number };
  end: { x: number; y: number };
};

export type Algorithm = "dfs" | "prims";

function createGrid(width: number, height: number): Cell[][] {
  return Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => ({
      x,
      y,
      walls: { top: true, right: true, bottom: true, left: true },
      visited: false,
    }))
  );
}

function removeWall(current: Cell, neighbor: Cell) {
  const dx = neighbor.x - current.x;
  const dy = neighbor.y - current.y;
  if (dx === 1) { current.walls.right = false; neighbor.walls.left = false; }
  if (dx === -1) { current.walls.left = false; neighbor.walls.right = false; }
  if (dy === 1) { current.walls.bottom = false; neighbor.walls.top = false; }
  if (dy === -1) { current.walls.top = false; neighbor.walls.bottom = false; }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getNeighbors(grid: Cell[][], cell: Cell, visited: boolean): Cell[] {
  const { x, y } = cell;
  const h = grid.length;
  const w = grid[0].length;
  const dirs = [
    { dx: 0, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
  ];
  return dirs
    .map(({ dx, dy }) => {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) return grid[ny][nx];
      return null;
    })
    .filter((c): c is Cell => c !== null && c.visited === visited);
}

export function generateDFS(width: number, height: number): Maze {
  const grid = createGrid(width, height);
  const stack: Cell[] = [];
  const start = grid[0][0];
  start.visited = true;
  stack.push(start);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const unvisited = shuffle(getNeighbors(grid, current, false));
    if (unvisited.length > 0) {
      const next = unvisited[0];
      next.visited = true;
      removeWall(current, next);
      stack.push(next);
    } else {
      stack.pop();
    }
  }

  // Reset visited for gameplay
  grid.forEach(row => row.forEach(c => (c.visited = false)));

  return {
    grid,
    width,
    height,
    start: { x: 0, y: 0 },
    end: { x: width - 1, y: height - 1 },
  };
}

export function generatePrims(width: number, height: number): Maze {
  const grid = createGrid(width, height);

  const startX = Math.floor(Math.random() * width);
  const startY = Math.floor(Math.random() * height);
  grid[startY][startX].visited = true;

  // Frontier: [cell, neighbor] pairs
  const frontier: Array<{ cell: Cell; from: Cell }> = [];

  const addFrontier = (cell: Cell) => {
    getNeighbors(grid, cell, false).forEach(n => {
      frontier.push({ cell: n, from: cell });
    });
  };

  addFrontier(grid[startY][startX]);

  while (frontier.length > 0) {
    const idx = Math.floor(Math.random() * frontier.length);
    const { cell, from } = frontier[idx];
    frontier.splice(idx, 1);

    if (!cell.visited) {
      cell.visited = true;
      removeWall(from, cell);
      addFrontier(cell);
    }
  }

  grid.forEach(row => row.forEach(c => (c.visited = false)));

  return {
    grid,
    width,
    height,
    start: { x: 0, y: 0 },
    end: { x: width - 1, y: height - 1 },
  };
}

export function generateMaze(
  width: number,
  height: number,
  algorithm: Algorithm
): Maze {
  return algorithm === "dfs"
    ? generateDFS(width, height)
    : generatePrims(width, height);
}

export function solveMaze(maze: Maze): Array<{ x: number; y: number }> {
  const { grid, start, end } = maze;
  const visited = Array.from({ length: maze.height }, () =>
    new Array(maze.width).fill(false)
  );
  const parent = new Map<string, string | null>();
  const queue = [start];
  const key = (p: { x: number; y: number }) => `${p.x},${p.y}`;
  visited[start.y][start.x] = true;
  parent.set(key(start), null);

  const dirs = [
    { dx: 0, dy: -1, wall: "top" as const },
    { dx: 1, dy: 0, wall: "right" as const },
    { dx: 0, dy: 1, wall: "bottom" as const },
    { dx: -1, dy: 0, wall: "left" as const },
  ];

  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (cur.x === end.x && cur.y === end.y) break;
    const cell = grid[cur.y][cur.x];

    for (const { dx, dy, wall } of dirs) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      if (
        nx >= 0 && nx < maze.width &&
        ny >= 0 && ny < maze.height &&
        !visited[ny][nx] &&
        !cell.walls[wall]
      ) {
        visited[ny][nx] = true;
        parent.set(key({ x: nx, y: ny }), key(cur));
        queue.push({ x: nx, y: ny });
      }
    }
  }

  const path: Array<{ x: number; y: number }> = [];
  let cur: string | null | undefined = key(end);
  while (cur) {
    const [x, y] = cur.split(",").map(Number);
    path.unshift({ x, y });
    cur = parent.get(cur);
  }
  return path;
}
