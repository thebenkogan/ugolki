import { Player } from "../types";

interface SquareProps {
  tileColor: string;
  player?: Player;
}

function Square({ tileColor, player }: SquareProps): JSX.Element {
  const background = tileColor == "dark" ? "bg-amber-700" : "bg-orange-300";

  return <div className={`${background} aspect-square`}>big</div>;
}

export default Square;
