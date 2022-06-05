import { Grid } from "../types";
import Square from "./Square";

interface BoardProps {
  board: Grid;
}

function Board({ board }: BoardProps): JSX.Element {
  return (
    <div className="flex justify-center items-center h-screen mx-10">
      <div className="grid grid-cols-8 grid-rows-8 w-screen">
        {board.flatMap((column, x) =>
          column.map((player, y) => {
            return (
              <Square
                tileColor={(x + y) % 2 == 0 ? "dark" : "light"}
                player={player ? player : undefined}
                key={`${x}-${y}`}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

export default Board;
