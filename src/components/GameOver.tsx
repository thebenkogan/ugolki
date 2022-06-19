import Card from "./Card";

interface GameOverProps {
  win: boolean;
}

function GameOver({ win }: GameOverProps): JSX.Element {
  const textColor = win ? "text-teal-500" : "text-red-500";
  return (
    <Card>
      <h1 className={`font-bold text-4xl ${textColor}`}>
        {win ? "You win!" : "You lose!"}
      </h1>
    </Card>
  );
}

export default GameOver;
