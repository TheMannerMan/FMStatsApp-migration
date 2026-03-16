export interface Assignment {
  slotIndex: number;
  playerIndex: number;
  score: number;
}

/**
 * Hungarian (Munkres) algorithm for maximization on rectangular matrices.
 *
 * Accepts an (n x m) matrix where n >= m (more players than slots).
 * Returns exactly m assignments — one per column (slot).
 *
 * Uses the O(n³) potential-based approach which is simpler to implement correctly.
 */
export function hungarian(matrix: number[][]): Assignment[] {
  const numRows = matrix.length;
  const numCols = matrix[0].length;
  const n = Math.max(numRows, numCols);

  // Convert to minimization: subtract from global max. Pad to square.
  let globalMax = 0;
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      if (matrix[i][j] > globalMax) globalMax = matrix[i][j];
    }
  }

  const cost: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => {
      if (i < numRows && j < numCols) return globalMax - matrix[i][j];
      return globalMax;
    }),
  );

  // u[i] = potential for row i, v[j] = potential for col j
  const u = new Array<number>(n + 1).fill(0);
  const v = new Array<number>(n + 1).fill(0);
  // p[j] = row assigned to column j (1-indexed rows, 0 = unassigned)
  const p = new Array<number>(n + 1).fill(0);
  // way[j] = predecessor column in augmenting path
  const way = new Array<number>(n + 1).fill(0);

  for (let i = 1; i <= n; i++) {
    // Start augmenting path from row i
    p[0] = i;
    let j0 = 0; // virtual column 0

    const minv = new Array<number>(n + 1).fill(Infinity);
    const used = new Array<boolean>(n + 1).fill(false);

    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = Infinity;
      let j1 = -1;

      for (let j = 1; j <= n; j++) {
        if (used[j]) continue;
        const cur = cost[i0 - 1][j - 1] - u[i0] - v[j];
        if (cur < minv[j]) {
          minv[j] = cur;
          way[j] = j0;
        }
        if (minv[j] < delta) {
          delta = minv[j];
          j1 = j;
        }
      }

      for (let j = 0; j <= n; j++) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else {
          minv[j] -= delta;
        }
      }

      j0 = j1;
    } while (p[j0] !== 0);

    // Update assignment along augmenting path
    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0 !== 0);
  }

  // Extract real assignments (discard padding)
  const assignments: Assignment[] = [];
  for (let j = 1; j <= n; j++) {
    const row = p[j] - 1;
    const col = j - 1;
    if (row < numRows && col < numCols) {
      assignments.push({
        slotIndex: col,
        playerIndex: row,
        score: matrix[row][col],
      });
    }
  }

  return assignments;
}
