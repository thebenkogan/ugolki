import type { NextPage } from "next";
import Head from "next/head";
import React, { useEffect } from "react";
import Board from "../../components/Board";
import { Game, Move, Player, Store } from "../../types";
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

  useEffect(() => {
    if (code && user && !game) {
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

        const data: Store = gameDoc.data() as Store;

        setDocRef(gameDoc.ref);

        if (!data.white && user.uid !== data.black) {
          await updateDoc(gameDoc.ref, { white: user.uid });
          data.white = user.uid;
        }
        if (!data.black && user.uid !== data.white) {
          await updateDoc(gameDoc.ref, { black: user.uid });
          data.black = user.uid;
        }

        let color: Player = "White";
        if (user.uid === data.white) {
          setGame(initializeGame("White", JSON.parse(data.moves)));
        } else if (user.uid === data.black) {
          setGame(initializeGame("Black", JSON.parse(data.moves)));
          color = "Black";
        } else {
          router.push("/");
        }
        setIsTurn(data.turn === color);

        const unsubscribe = onSnapshot(gameDoc.ref, (doc) => {
          if (!doc.data()) {
            // game expired
            router.push("/");
            return;
          }
          if (doc.data()!.turn === color) {
            setIsTurn(true);
            const moves: Move[] = JSON.parse(doc.data()!.moves);
            const lastMove = moves[moves.length - 1];
            if (!lastMove) return;
            setPastMoves(moves);
            setGame((game) =>
              playMove(
                game!,
                game!.color === "White" ? lastMove : flipMove(lastMove)
              )
            );
          }
        });

        return () => unsubscribe();
      };
      initialize();
    }
  }, [code, user, router, game]);

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
