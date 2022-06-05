export type Player = "White" | "Black";

export type Grid = Array<Array<Player | null>>;

export type Game = {
  board: Grid;
  currentPlayer: Player;
};
