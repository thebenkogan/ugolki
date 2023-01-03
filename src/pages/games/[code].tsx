import type { NextPage } from "next";
import Head from "next/head";
import Board from "../../components/Board";
import { useRouter } from "next/router";
import { updateDoc } from "firebase/firestore";
import Loading from "../../components/Loading";
import GameOver from "../../components/GameOver";
import Header from "../../components/Header";
import useInitialGame from "../../game/useInitialGame";
import { GameStore, useGameSync } from "../../firebase/utils";
import { Game, Player } from "../../game/game";
import { Move } from "../../game/moves";

export interface GameData {
  pastMoves: Move[];
  isTurn: boolean;
  winner: Player | null;
  rematch: Player | null;
  game: Game;
}

const Home: NextPage = () => {
  const router = useRouter();
  const { code } = router.query;
  const { data: initialData, docRef, fail } = useInitialGame(code as string);
  if (fail) router.push("/");
  const [gameData, setGameData] = useGameSync(initialData, docRef);
  if (!gameData || !docRef) return <Loading />;
  const { winner, rematch, game } = gameData;

  const requestRematch = async () => {
    if (!rematch) {
      setGameData({ ...gameData, rematch: game.color });
      await updateDoc(docRef, { rematch: game.color });
    } else if (rematch !== game.color) {
      const resetData: Partial<GameStore> = {
        moves: "[]",
        winner: null,
        rematch: null,
      };
      await updateDoc(docRef, resetData);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden items-center justify-between">
      <Head>
        <title>Ugolki</title>
        <meta name="description" content="Ugolki" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      {winner && gameData ? (
        <GameOver
          win={winner === game.color}
          rematch={
            rematch === null ? "none" : rematch === game.color ? "us" : "them"
          }
          requestRematch={requestRematch}
        />
      ) : (
        <Board docRef={docRef} gameData={gameData} setGameData={setGameData} />
      )}

      <button
        onClick={() => {
          navigator.clipboard.writeText(`${code}`);
          (document.activeElement as HTMLElement)?.blur();
        }}
        className="bg-teal-500 focus:bg-teal-700 font-bold py-2 px-4 rounded-full mt-5 mb-20 sm:mb-5"
      >
        {code} 📋
      </button>
    </div>
  );
};

export default Home;
