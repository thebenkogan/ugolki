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

export function playMove(game: Game, move: Move): Game {
  game.board[move.end[1]][move.end[0]] =
    game.board[move.start[1]][move.start[0]];
  game.board[move.start[1]][move.start[0]] = null;
  return {
    ...game,
    moves: calculateLegalMoves(game.board, game.currentPlayer),
  };
}

export function initializeGame(player: Player): Game {
  const opp = player === "White" ? "Black" : "White";
  const board = startBoard(player, opp);
  return {
    board: board,
    currentPlayer: player,
    moves: calculateLegalMoves(board, player),
  };
}
