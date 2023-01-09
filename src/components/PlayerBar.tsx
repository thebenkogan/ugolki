import { GameUser } from "../firebase/users";
import Image from "next/image";

interface PlayerBarProps {
  gameUser?: GameUser;
}

function PlayerBar({ gameUser }: PlayerBarProps): JSX.Element {
  return (
    <div className="flex items-center player-bar-width sm:phone-player-bar-width relative h-7 sm:h-11 my-4 sm:mb-2">
      {gameUser && (
        <>
          <Image
            src={gameUser.photoURL}
            alt={gameUser.name}
            width={40}
            height={40}
            className="rounded-2xl"
          />

          <div className="font-bold mx-2">{gameUser.name}</div>
        </>
      )}
    </div>
  );
}

export default PlayerBar;
