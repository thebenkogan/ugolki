import React from "react";
import { firestore } from "../../firebase/clientApp";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import Card from "./Card";

const gamesCollection = collection(firestore, "games");
const auth = getAuth(firestore.app);

function GameForm(): JSX.Element {
  const router = useRouter();

  const [code, setCode] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const games = await getDocs(gamesCollection);

    if (!games.docs.find((game) => game.id === code)) {
      setError("Game not found");
      return;
    }

    router.push(`games/${code}`);
  };

  const handleCreate = async () => {
    setError("");

    const games = await getDocs(gamesCollection);
    let newCode = "";

    const generateCode = () => {
      newCode = ("" + Math.random()).substring(2, 7);
      if (games.docs.find((game) => game.id === newCode)) {
        generateCode();
      }
    };
    generateCode();

    await setDoc(doc(gamesCollection, newCode), {
      turn: Math.random() < 0.5 ? "Black" : "White",
    });
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
        <div className="flex items-center border-b border-teal-500 py-2">
          <input
            onChange={(e) => setCode(e.target.value)}
            className="appearance-none bg-transparent border-none w-full mr-3 py-1 px-2 leading-tight focus:outline-none text-white"
            type="text"
            placeholder="Lobby Code"
            aria-label="lobby code"
          />
          <button
            className="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-4 rounded"
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
