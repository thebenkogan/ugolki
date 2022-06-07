import { Coordinates, Game, Grid, Move } from "../types";

const directions = [
  [-1, 0],
  [0, -1],
  [0, 1],
  [1, 0],
];

export function calculateLegalMoves({ board, currentPlayer }: Game): Move[] {
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
      if (!isInBounds([x + jx, y + jy])) return;
      if (
        !posInPath(path, [x + jx, y + jy]) &&
        board[y + dy][x + dx] !== null &&
        board[y + jy][x + jx] === null
      ) {
        findMoves([x + jx, y + jy], [...seen, [x + jx, y + jy]]);
        jumpMoves.push({
          start: [x, y],
          end: [x + jx, y + jy],
          path: seen,
        });
      }
    });
  };

  findMoves([x, y], []);

  return jumpMoves;
}

function posInPath(path: Coordinates[], [x, y]: Coordinates): boolean {
  return path.some(([px, py]) => px === x && py === y);
}

function isInBounds([x, y]: Coordinates): boolean {
  return x >= 0 && x <= 7 && y >= 0 && y <= 7;
}
