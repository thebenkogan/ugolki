export type Player = "White" | "Black";

export type Coordinates = [number, number];

export type Move = {
  start: Coordinates;
  end: Coordinates;
  path?: Coordinates[]; // for jump moves, start and end exclusive
};

export type Grid = Array<Array<Player | null>>;

export type Game = {
  board: Grid;
  currentPlayer: Player;
};
