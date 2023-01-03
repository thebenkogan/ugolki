import { calculateLegalMoves, flipMove, Move } from "./moves";

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

export function isGameOver(game: Game): Player | null {
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
