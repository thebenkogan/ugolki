import {
  calculateLegalMoves,
  Coordinates,
  flipMove,
  Move,
  movesEqual,
} from "./moves";

export type Game = {
  board: Grid;
  color: Player;
  moves: Move[];
};

export type Grid = Array<Array<Player | null>>;

export type Player = "White" | "Black";

const startBoard = (player: Player, opp: Player) => [
  [opp, opp, opp, opp, null, null, null, null],
  [opp, opp, opp, opp, null, null, null, null],
  [opp, opp, opp, opp, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, player, player, player, player],
  [null, null, null, null, player, player, player, player],
  [null, null, null, null, player, player, player, player],
];

export function makeMove(board: Grid, move: Move): Grid {
  if (board[move.start[1]][move.start[0]] !== null) {
    board[move.end[1]][move.end[0]] = board[move.start[1]][move.start[0]];
    board[move.start[1]][move.start[0]] = null;
  }
  return board;
}

export function makeMoves(board: Grid, moves: Move[]): Grid {
  return moves.reduce((board, move) => {
    return makeMove(board, move);
  }, board);
}

export function playMove(game: Game, move: Move): Game {
  const board = makeMove(game.board, move);
  return {
    board,
    color: game.color,
    moves: calculateLegalMoves(board, game.color),
  };
}

export function initializeGame(player: Player, moves: Move[]): Game {
  const opp = player === "White" ? "Black" : "White";
  const movesForColor = player === "White" ? moves : moves.map(flipMove);
  const board = makeMoves(startBoard(player, opp), movesForColor);
  return {
    board: board,
    color: player,
    moves: calculateLegalMoves(board, player),
  };
}

/**
 * @param game the game to check for a winner
 * @param pastMoves the moves that have been played in the game
 * @returns the winning player's color if there is a winner, null otherwise.
 * If there is a threefold repetition (i.e. the last player to move has made
 * that move twice in the last 4 folds), returns the player closest to winning.
 */
export function isGameOver(game: Game, pastMoves: Move[]): Player | null {
  let winner = getWinner(game);
  if (winner != null) return winner;
  if (isThreeFoldRepetition(pastMoves)) return closestToWinning(game);
  return null;
}

function getWinner(game: Game): Player | null {
  const playerColor = game.color;
  const oppColor = game.color === "White" ? "Black" : "White";
  let player = true;
  let opp = true;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 4; j++) {
      player &&= game.board[i][j] === playerColor;
      opp &&= game.board[7 - i][7 - j] === oppColor;
    }
  }
  return player ? playerColor : opp ? oppColor : null;
}

function manhattanDistance(
  [ax, ay]: Coordinates,
  [bx, by]: Coordinates
): number {
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

/**
 * @param game the current game
 * @returns the player whose pieces are closest to the winning corner; the
 * distance is calculated as the average manhattan distance of all pieces
 */
export function closestToWinning(game: Game): Player {
  const playerColor = game.color;
  const oppColor = game.color === "White" ? "Black" : "White";
  const playerCorner: Coordinates = [0, 0];
  const oppCorner: Coordinates = [7, 7];

  let playerDists = 0;
  let oppDists = 0;
  game.board.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === playerColor) {
        playerDists += manhattanDistance([x, y], playerCorner);
      } else if (cell === oppColor) {
        oppDists += manhattanDistance([x, y], oppCorner);
      }
    });
  });

  // average the manhattan distances over all 12 pieces
  playerDists = playerDists / 12;
  oppDists = oppDists / 12;

  return playerDists < oppDists ? playerColor : oppColor;
}

/**
 * @param pastMoves the past moves of the game
 * @returns true if the last player to make a move has repeated this move
 * 3 times in the past 4 folds. I.e. we care about these highlighted moves:
 *
 * `[..., pl*, opp, pl, opp, pl*, opp, pl, opp, pl*]`
 */
function isThreeFoldRepetition(pastMoves: Move[]) {
  if (pastMoves.length < 9) return false;

  const playerMoves: Move[] = [];
  for (let i = 0; i < 3; i++) {
    playerMoves.push(pastMoves[pastMoves.length - 4 * i - 1]);
  }

  return playerMoves.every((move) => movesEqual(move, playerMoves[0]));
}
