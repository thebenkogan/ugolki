import type { NextPage } from "next";
import Head from "next/head";
import React, { useEffect } from "react";
import Board from "../../components/Board";
import { Game, Move, Player, Store } from "../../types";
import { useRouter } from "next/router";
import { updateDoc, onSnapshot } from "firebase/firestore";
import { initializeGame, playMove } from "../../game/game";
import Loading from "../../components/Loading";
import { flipMove } from "../../game/moves";
import GameOver from "../../components/GameOver";
import Header from "../../components/Header";
import useInitialGame from "../../game/useInitialGame";

const Home: NextPage = () => {
  const [game, setGame] = React.useState<Game | null>(null);
  const [pastMoves, setPastMoves] = React.useState<Move[]>([]);
  const [isTurn, setIsTurn] = React.useState<boolean>(false);
  const [winner, setWinner] = React.useState<Player | null>(null);
  const [rematch, setRematch] = React.useState<Player | null>(null);
  const router = useRouter();
  const { code } = router.query;
  const { data, fail } = useInitialGame(code as string);
  if (fail) router.push("/");

  useEffect(() => {
    if (data) {
      setPastMoves(data.pastMoves);
      setIsTurn(data.isTurn);
      setWinner(data.winner);
      setRematch(data.rematch);

      const unsubscribe = onSnapshot(data.docRef, (doc) => {
        const newData = doc.data() as Store | undefined;
        if (!newData) {
          // game expired
          router.push("/");
          return;
        }

        setIsTurn(newData.turn === data.color);
        setWinner(newData.winner);
        setRematch(newData.rematch);
        const moves: Move[] = JSON.parse(newData.moves);
        const lastMove = moves[moves.length - 1];
        setPastMoves(moves);
        setGame((game) => {
          if (lastMove && game) {
            if (newData.turn === data.color && !newData.winner) {
              console.log("play");
              return playMove(
                game,
                game.color === "White" ? lastMove : flipMove(lastMove)
              );
            } else {
              return game;
            }
          } else {
            return initializeGame(data.color, moves);
          }
        });
      });

      return () => unsubscribe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, router]);

  const requestRematch = async () => {
    if (!rematch) {
      setRematch(game!.color);
      await updateDoc(data!.docRef, { rematch: game!.color });
    } else if (rematch !== game!.color) {
      const resetData: Partial<Store> = {
        moves: "[]",
        winner: null,
        rematch: null,
      };
      await updateDoc(data!.docRef, resetData);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-x-hidden items-center">
      <Head>
        <title>Ugolki</title>
        <meta name="description" content="Ugolki" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      {winner && game ? (
        <GameOver
          win={winner === game.color}
          rematch={
            rematch === null ? "none" : rematch === game.color ? "us" : "them"
          }
          requestRematch={requestRematch}
        />
      ) : game ? (
        <Board
          game={game}
          setGame={setGame}
          pastMoves={pastMoves}
          isTurn={isTurn}
          setIsTurn={setIsTurn}
          docRef={data!.docRef}
          setWinner={setWinner}
        />
      ) : (
        <Loading />
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
