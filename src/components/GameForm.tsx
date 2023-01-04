import React from "react";
import { useRouter } from "next/router";
import { getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import Card from "./Card";
import { firestore } from "../firebase/clientApp";
import { createGame, isValidGameCode } from "../firebase/games";

const auth = getAuth(firestore.app);

function GameForm(): JSX.Element {
  const [user] = useAuthState(auth);
  const router = useRouter();

  const [code, setCode] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (await isValidGameCode(code)) {
      router.push(`games/${code}`);
    } else {
      setError("Game not found");
    }
  };

  const handleCreate = async () => {
    setError("");
    let newCode = await createGame(user!);
    router.push(`games/${newCode}`);
  };

  return (
    <Card>
      <div className="py-4">
        <div className="text-center text-xl sm:text-2xl font-bold">
          Create lobby or enter code to play!
        </div>
      </div>
      <form onSubmit={handleJoin} className="w-full max-w-sm my-5">
        <div className="flex flex-col sm:flex-row items-center sm:border-b sm:border-teal-500 py-2">
          <input
            onChange={(e) => setCode(e.target.value)}
            className="appearance-none bg-transparent border-b border-teal-500 sm:border-none w-full mr-3 py-1 px-2 leading-tight focus:outline-none text-white text-center sm:text-left"
            type="text"
            placeholder="Lobby Code"
            aria-label="lobby code"
          />
          <button
            className="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-4 rounded mt-4 mb-2 sm:my-0"
            type="submit"
          >
            Join
          </button>
          <button
            onClick={handleCreate}
            className="flex-shrink-0 border-transparent border-4 text-teal-500 hover:text-teal-800 text-sm py-1 px-2 rounded"
            type="button"
          >
            Create Lobby
          </button>
        </div>
      </form>
      {error && <div className="text-red-500 text-center pb-5">{error}</div>}
    </Card>
  );
}

export default GameForm;
