import { Coordinates, Grid, Move, Player } from "../types";

const directions = [
  [-1, 0],
  [0, -1],
  [0, 1],
  [1, 0],
];

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
          path: seen,
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

function posInPath(path: Coordinates[], [x, y]: Coordinates): boolean {
  return path.some(([px, py]) => px === x && py === y);
}

function isInBounds([x, y]: Coordinates): boolean {
  return x >= 0 && x <= 7 && y >= 0 && y <= 7;
}
