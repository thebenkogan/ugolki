import type { NextPage } from "next";
import Head from "next/head";
import React, { useEffect } from "react";
import Board from "../../components/Board";
import { Game, Store } from "../../types";
import { useRouter } from "next/router";
import { getAuth } from "firebase/auth";
import {
  collection,
  where,
  query,
  getDocs,
  documentId,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { firestore } from "../../../firebase/clientApp";
import { useAuthState } from "react-firebase-hooks/auth";
import { initializeGame } from "../../game/game";

const gamesCollection = collection(firestore, "games");
const auth = getAuth(firestore.app);

const Home: NextPage = () => {
  const [game, setGame] = React.useState<Game | null>(null);
  const router = useRouter();
  const { code } = router.query;
  const [user] = useAuthState(auth);

  useEffect(() => {
    const initialize = async () => {
      const gameDoc = (
        await getDocs(
          query(gamesCollection, where(documentId(), "==", `${code}`))
        )
      ).docs[0];
      const data: Store = gameDoc.data() as Store;

      if (!gameDoc) {
        router.push("/");
        return;
      }

      if (!data.white) {
        await updateDoc(gameDoc.ref, { white: user!.uid });
        data.white = user!.uid;
      } else {
        await updateDoc(gameDoc.ref, { black: user!.uid });
        data.black = user!.uid;
      }

      if (user!.uid === data.white) {
        setGame(initializeGame("White", data.moves));
      } else if (user!.uid === data.black) {
        setGame(initializeGame("Black", data.moves));
      } else {
        router.push("/");
      }
    };
    initialize();
  }, [code, user, router]);

  return (
    <div className="flex flex-col h-screen overflow-x-hidden">
      <Head>
        <title>Ugolki</title>
        <meta name="description" content="Ugolki" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="text-center font-bold text-6xl my-5">Ugolki</h1>
      {game && <Board game={game} setGame={setGame} />}
    </div>
  );
};

export default Home;
