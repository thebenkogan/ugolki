import { Player } from "../types";

interface SquareProps {
  tileColor: string;
  player?: Player;
}

function Square({ tileColor, player }: SquareProps): JSX.Element {
  const background = tileColor == "dark" ? "bg-amber-700" : "bg-orange-300";
  const pieceColor = player == "White" ? "bg-white" : "bg-neutral-800";

  return (
    <div
      className={`${background} aspect-square flex justify-center items-center`}
    >
      {player && (
        <div className={`${pieceColor} w-1/2 h-1/2 rounded-full`}></div>
      )}
    </div>
  );
}

export default Square;
