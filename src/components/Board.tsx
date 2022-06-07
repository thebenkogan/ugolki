import { Grid } from "../types";
import Square from "./Square";

interface BoardProps {
  board: Grid;
}

function Board({ board }: BoardProps): JSX.Element {
  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <div className="grid grid-cols-8 grid-rows-8 w-screen sm:max-w-xl mx-5">
        {board.flatMap((column, x) =>
          column.map((player, y) => {
            return (
              <Square
                key={x * 10 + y}
                tileColor={(x + y) % 2 == 0 ? "dark" : "light"}
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
