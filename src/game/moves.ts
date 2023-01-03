import { Grid, Player } from "./game";

const directions = [
  [-1, 0],
  [0, -1],
  [0, 1],
  [1, 0],
];

export type Move = {
  start: Coordinates;
  end: Coordinates;
  path?: Coordinates[]; // for jump moves, start and end exclusive
};

export type Coordinates = [number, number];

export function calculateLegalMoves(
  board: Grid,
  currentPlayer: Player
): Move[] {
  const legalMoves: Move[] = [];

  board.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell == currentPlayer) {
        legalMoves.push(...calculateLegalMovesForPiece(board, [x, y]));
      }
    });
  });

  return legalMoves;
}

function calculateLegalMovesForPiece(board: Grid, [x, y]: Coordinates): Move[] {
  const legalMoves: Move[] = [];

  directions.forEach(([dx, dy]) => {
    if (!isInBounds([x + dx, y + dy])) return;
    if (board[y + dy][x + dx] === null) {
      legalMoves.push({
        start: [x, y],
        end: [x + dx, y + dy],
      });
    }
  });

  return [...legalMoves, ...findJumpMoves(board, [x, y])];
}

function findJumpMoves(board: Grid, [x, y]: Coordinates): Move[] {
  const jumpMoves: Move[] = [];

  const findMoves = ([cx, cy]: Coordinates, seen: Coordinates[]) => {
    const path: Coordinates[] = [...seen, [cx, cy]];
    directions.forEach(([dx, dy]) => {
      const [jx, jy] = [dx * 2, dy * 2];
      const nextJump: Coordinates = [cx + jx, cy + jy];
      if (!isInBounds(nextJump)) return;
      if (
        !posInPath(path, nextJump) &&
        board[cy + dy][cx + dx] !== null &&
        board[nextJump[1]][nextJump[0]] === null
      ) {
        findMoves(nextJump, [...seen, nextJump]);
        jumpMoves.push({
          start: [x, y],
          end: nextJump,
          path: seen.length ? seen : undefined,
        });
      }
    });
  };

  findMoves([x, y], []);

  return jumpMoves;
}

export function movesFromCoordinate(
  moves: Move[],
  [x, y]: Coordinates
): Move[] {
  return moves.filter(({ start }) => start[0] === x && start[1] === y);
}

export function flipMove(move: Move): Move {
  return {
    start: [7 - move.start[0], 7 - move.start[1]],
    end: [7 - move.end[0], 7 - move.end[1]],
    path: move.path?.map(([x, y]) => [7 - x, 7 - y]),
  };
}

export function moveContainsCoordinate(
  move: Move,
  [x, y]: Coordinates
): boolean {
  return (
    (move.start[0] === x && move.start[1] === y) ||
    (move.end[0] === x && move.end[1] === y) ||
    !!move.path?.some(([px, py]) => px === x && py === y)
  );
}

/**
 * @param moves list of moves to search through
 * @param start target start coordinate
 * @param end target end coordinate
 * @returns the move in [moves] with the given [start] and [end] coordinate,
 * or undefined if no such move exists
 */
export function findMove(moves: Move[], start: Coordinates, end: Coordinates) {
  const [sx, sy] = start;
  const [ex, ey] = end;
  return moves.find(
    ({ start: [msx, msy], end: [mex, mey] }) =>
      msx === sx && msy === sy && mex === ex && mey === ey
  );
}

function posInPath(path: Coordinates[], [x, y]: Coordinates): boolean {
  return path.some(([px, py]) => px === x && py === y);
}

function isInBounds([x, y]: Coordinates): boolean {
  return x >= 0 && x <= 7 && y >= 0 && y <= 7;
}
