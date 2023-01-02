import { Coordinates, Player } from "../types";

interface SquareProps {
  coord: Coordinates;
  tileColor: string;
  highlighted: boolean;
  isLastMoveSquare: boolean;
  handleClick: (highlighted: Coordinates, isMove: boolean) => void;
  player?: Player;
}

function Square({
  coord,
  tileColor,
  highlighted,
  isLastMoveSquare,
  handleClick,
  player,
}: SquareProps): JSX.Element {
  const background = highlighted
    ? "bg-green-400"
    : isLastMoveSquare
    ? "bg-yellow-500"
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
        <div
          className={`${pieceColor} w-1/2 h-1/2 rounded-full aspect-square`}
        ></div>
      )}
    </div>
  );
}

export default Square;
