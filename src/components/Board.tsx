import React from "react";
import { playMove } from "../game/game";
import { movesFromCoordinate } from "../game/moves";
import { Coordinates, Game } from "../types";
import Square from "./Square";

interface BoardProps {
  game: Game;
  setGame: (game: Game) => void;
}

function Board({ game, setGame }: BoardProps): JSX.Element {
  const [highlighted, setHighlighted] = React.useState<Coordinates[]>([]);
  const [selected, setSelected] = React.useState<Coordinates | null>(null);

  const handleClick = ([cx, cy]: Coordinates, isMove: boolean): void => {
    if (isMove) {
      setGame(playMove(game, { start: selected!, end: [cx, cy] }));
      setSelected(null);
      setHighlighted([]);
    } else {
      setHighlighted(
        game.board[cy][cx] === game.color
          ? movesFromCoordinate(game.moves, [cx, cy]).map((move) => move.end)
          : []
      );
      setSelected([cx, cy]);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <div className="grid grid-cols-8 grid-rows-8 w-screen sm:max-w-xl mx-5 border-4 border-black">
        {game.board.flatMap((row, y) =>
          row.map((player, x) => {
            return (
              <Square
                key={x * 10 + y}
                coord={[x, y]}
                tileColor={(x + y) % 2 == 0 ? "dark" : "light"}
                highlighted={highlighted.some(
                  ([hx, hy]) => hx === x && hy === y
                )}
                handleClick={handleClick}
                player={player ? player : undefined}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

export default Board;
