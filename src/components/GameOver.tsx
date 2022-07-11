import Card from "./Card";

interface GameOverProps {
  win: boolean;
  rematch: "none" | "us" | "them"; // who requested a rematch
  requestRematch: () => Promise<void>;
}

const rematchSettings = {
  none: ["Rematch?", "bg-teal-500", "hover:bg-teal-700"],
  us: ["Requested", "bg-green-500", "hover:bg-green-500"],
  them: ["Play Again", "bg-blue-500", "hover:bg-blue-700"],
};

function GameOver({
  win,
  rematch,
  requestRematch,
}: GameOverProps): JSX.Element {
  const textColor = win ? "text-teal-500" : "text-red-500";
  const [rText, rBackground, rHover] = rematchSettings[rematch];

  const cursor = rematch === "us" ? "cursor-default" : "cursor-grab";
  return (
    <Card>
      <h1 className={`font-bold text-4xl ${textColor}`}>
        {win ? "You win!" : "You lose!"}
      </h1>
      <button
        className={`flex-shrink-0 ${rBackground} ${rHover} text-sm text-white py-2 px-4 rounded mt-10 mb-2 cursor-g ${cursor}`}
        type="submit"
        onClick={rematch !== "us" ? requestRematch : () => {}}
      >
        {rText}
      </button>
    </Card>
  );
}

export default GameOver;
