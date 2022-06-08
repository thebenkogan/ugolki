import { Game, Grid, Move } from "../types";
import { calculateLegalMoves } from "./moves";

const START_BOARD: Grid = [
  ["Black", "Black", "Black", "Black", null, null, null, null],
  ["Black", "Black", "Black", "Black", null, null, null, null],
  ["Black", "Black", "Black", "Black", null, null, null, null],
  ["Black", "Black", "Black", "Black", null, null, null, null],
  [null, null, null, null, "White", "White", "White", "White"],
  [null, null, null, null, "White", "White", "White", "White"],
  [null, null, null, null, "White", "White", "White", "White"],
  [null, null, null, null, "White", "White", "White", "White"],
];

export function playMove(game: Game, move: Move): Game {
  game.board[move.end[1]][move.end[0]] =
    game.board[move.start[1]][move.start[0]];
  game.board[move.start[1]][move.start[0]] = null;
  return {
    ...game,
    moves: calculateLegalMoves(game.board, game.currentPlayer),
  };
}

export function initializeGame(): Game {
  return {
    board: START_BOARD,
    currentPlayer: "White",
    moves: calculateLegalMoves(START_BOARD, "White"),
  };
}
