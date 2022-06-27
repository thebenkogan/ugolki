import { movesFromCoordinate } from "../game/moves";
import { Coordinates, Player } from "../types";

interface SquareProps {
  coord: Coordinates;
  tileColor: string;
  highlighted: boolean;
  handleClick: (highlighted: Coordinates, isMove: boolean) => void;
  player?: Player;
}

function Square({
  coord,
  tileColor,
  highlighted,
  handleClick,
  player,
}: SquareProps): JSX.Element {
  const background = highlighted
    ? "bg-green-400"
    : tileColor == "dark"
    ? "bg-amber-700"
    : "bg-orange-300";
  const pieceColor = player == "White" ? "bg-white" : "bg-neutral-800";

  return (
    <div
      onClick={() => handleClick(coord, highlighted)}
      className={`${background} aspect-square flex justify-center items-center p-1 sm:hover:border-4 hover:border-slate-400 sm:hover:p-0`}
    >
      {player && (
        <div className={`${pieceColor} w-1/2 h-1/2 rounded-full`}></div>
      )}
    </div>
  );
}

export default Square;
