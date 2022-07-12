import { getAuth } from "firebase/auth";
import {
  getDocs,
  query,
  where,
  documentId,
  updateDoc,
  collection,
  DocumentReference,
} from "firebase/firestore";
import { firestore } from "../../firebase/clientApp";
import { Store, Player, Move, Game } from "../types";
import { initializeGame } from "./game";
import React, { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

const gamesCollection = collection(firestore, "games");
const auth = getAuth(firestore.app);

interface initialGame {
  docRef: DocumentReference;
  game: Game;
  color: Player;
  pastMoves: Move[];
  isTurn: boolean;
  winner: Player | null;
  rematch: Player | null;
}

function useInitialGame(code: string): {
  data?: initialGame;
  fail?: boolean;
} {
  const [user] = useAuthState(auth);
  const [initGame, setInitGame] = React.useState<initialGame | undefined>(
    undefined
  );
  const [fail, setFail] = React.useState<boolean>(false);

  useEffect(() => {
    if (user) {
      const initialize = async () => {
        const gameDoc = (
          await getDocs(
            query(gamesCollection, where(documentId(), "==", `${code}`))
          )
        ).docs[0];

        if (!gameDoc) {
          setFail(true);
          return;
        }

        const data = gameDoc.data() as Store;

        if (!data.white && user.uid !== data.black) {
          await updateDoc(gameDoc.ref, { white: user.uid });
          data.white = user.uid;
        }
        if (!data.black && user.uid !== data.white) {
          await updateDoc(gameDoc.ref, { black: user.uid });
          data.black = user.uid;
        }

        let color: Player = "White";
        let game: Game;
        if (user.uid === data.white) {
          game = initializeGame("White", JSON.parse(data.moves));
        } else if (user.uid === data.black) {
          game = initializeGame("Black", JSON.parse(data.moves));
          color = "Black";
        } else {
          setFail(true);
          return;
        }

        setInitGame({
          docRef: gameDoc.ref,
          game,
          color,
          pastMoves: JSON.parse(data.moves),
          isTurn: data.turn === color,
          winner: data.winner,
          rematch: data.rematch,
        });
      };
      initialize();
    }
  }, [user, code]);

  return { data: initGame, fail };
}

export default useInitialGame;
