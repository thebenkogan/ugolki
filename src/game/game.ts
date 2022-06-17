import { Game, Grid, Move, Player } from "../types";
import { calculateLegalMoves } from "./moves";

const startBoard = (player: Player, opp: Player) => [
  [opp, opp, opp, opp, null, null, null, null],
  [opp, opp, opp, opp, null, null, null, null],
  [opp, opp, opp, opp, null, null, null, null],
  [opp, opp, opp, opp, null, null, null, null],
  [null, null, null, null, player, player, player, player],
  [null, null, null, null, player, player, player, player],
  [null, null, null, null, player, player, player, player],
  [null, null, null, null, player, player, player, player],
];

export function makeMove(board: Grid, move: Move): Grid {
  board[move.end[1]][move.end[0]] = board[move.start[1]][move.start[0]];
  board[move.start[1]][move.start[0]] = null;
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
    currentPlayer: game.currentPlayer,
    moves: calculateLegalMoves(board, game.currentPlayer),
  };
}

export function initializeGame(player: Player, moves: Move[]): Game {
  const opp = player === "White" ? "Black" : "White";
  const board = makeMoves(startBoard(player, opp), moves);
  return {
    board: board,
    currentPlayer: player,
    moves: calculateLegalMoves(board, player),
  };
}
