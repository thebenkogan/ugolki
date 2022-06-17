import type { NextPage } from "next";
import Head from "next/head";
import React, { useEffect } from "react";
import Board from "../../components/Board";
import { Game, Move, Store } from "../../types";
import { useRouter } from "next/router";
import { getAuth } from "firebase/auth";
import {
  collection,
  where,
  query,
  getDocs,
  documentId,
  updateDoc,
  DocumentReference,
  onSnapshot,
} from "firebase/firestore";
import { firestore } from "../../../firebase/clientApp";
import { useAuthState } from "react-firebase-hooks/auth";
import { initializeGame, playMove } from "../../game/game";
import Loading from "../../components/Loading";
import { flipMove } from "../../game/moves";

const gamesCollection = collection(firestore, "games");
const auth = getAuth(firestore.app);

const Home: NextPage = () => {
  const [game, setGame] = React.useState<Game | null>(null);
  const [pastMoves, setPastMoves] = React.useState<Move[]>([]);
  const [isTurn, setIsTurn] = React.useState<boolean>(false);
  const [docRef, setDocRef] = React.useState<DocumentReference | null>(null);
  const router = useRouter();
  const { code } = router.query;
  const [user] = useAuthState(auth);

  if (docRef) {
    onSnapshot(docRef, (doc) => {
      console.log(game);
      if (doc.data()!.turn === game!.color) {
        const moves: Move[] = JSON.parse(doc.data()!.moves);
        const lastMove = moves[moves.length - 1];
        setPastMoves(moves);
        setIsTurn(true);
        setGame((game) =>
          playMove(
            game!,
            game!.color === "White" ? lastMove : flipMove(lastMove)
          )
        );
      }
    });
  }

  useEffect(() => {
    if (code && user) {
      const initialize = async () => {
        const gameDoc = (
          await getDocs(
            query(gamesCollection, where(documentId(), "==", `${code}`))
          )
        ).docs[0];

        if (!gameDoc) {
          router.push("/");
          return;
        }
        setDocRef(gameDoc.ref);

        const data: Store = gameDoc.data() as Store;

        if (!data.white && user.uid !== data.black) {
          await updateDoc(gameDoc.ref, { white: user.uid });
          data.white = user.uid;
        }
        if (!data.black && user.uid !== data.white) {
          await updateDoc(gameDoc.ref, { black: user.uid });
          data.black = user.uid;
        }

        if (user.uid === data.white) {
          setGame(initializeGame("White", JSON.parse(data.moves)));
          setIsTurn(data.turn === data.white);
        } else if (user.uid === data.black) {
          setGame(initializeGame("Black", JSON.parse(data.moves)));
          setIsTurn(data.turn === data.black);
        } else {
          router.push("/");
        }
      };
      initialize();
    }
  }, [code, user, router]);

  return (
    <div className="flex flex-col h-screen overflow-x-hidden">
      <Head>
        <title>Ugolki</title>
        <meta name="description" content="Ugolki" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="text-center font-bold text-6xl my-5">Ugolki</h1>
      {game ? (
        <Board
          game={game}
          setGame={setGame}
          pastMoves={pastMoves}
          isTurn={isTurn}
          setIsTurn={setIsTurn}
          docRef={docRef!}
        />
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default Home;
