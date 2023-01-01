import { User } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  documentId,
  updateDoc,
  Timestamp,
  DocumentData,
  DocumentReference,
  onSnapshot,
} from "firebase/firestore";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { playMove, initializeGame } from "../game/game";
import { flipMove } from "../game/moves";
import { GameData } from "../pages/games/[code]";
import { Move, Player } from "../types";
import { firestore } from "./clientApp";

const gamesCollection = collection(firestore, "games");

export type GameStore = {
  moves: string;
  white: string | null;
  black: string | null;
  turn: Player;
  winner: Player | null;
  rematch: Player | null;
  timestamp: Timestamp;
};

/**
 * @param code Game lobby code
 * @param user The current active user
 * @returns The updated game information, with this user potentially filling
 * an open spot. Null if the game does not exist or if it is full and this
 * user is not one of the players.
 */
export async function updateAndRetrieveGameInfo(
  code: string,
  user: User
): Promise<[GameData, DocumentReference<DocumentData>] | null> {
  const gameDoc = (
    await getDocs(query(gamesCollection, where(documentId(), "==", `${code}`)))
  ).docs[0];
  if (!gameDoc) return null;
  const data = gameDoc.data() as GameStore;

  // update white or black player spots if empty and this player can fill it
  if (!data.white && user.uid !== data.black) {
    await updateDoc(gameDoc.ref, { white: user.uid });
    data.white = user.uid;
  }
  if (!data.black && user.uid !== data.white) {
    await updateDoc(gameDoc.ref, { black: user.uid });
    data.black = user.uid;
  }

  let color: Player = user.uid === data.white ? "White" : "Black";
  if (user.uid !== data.white && user.uid !== data.black) return null;

  let moves: Move[] = JSON.parse(data.moves);

  return [
    {
      pastMoves: moves,
      isTurn: data.turn === color,
      winner: data.winner,
      rematch: data.rematch,
      game: initializeGame(color, moves),
    },
    gameDoc.ref,
  ];
}

export function useGameSync(
  initialGameData?: GameData,
  docRef?: DocumentReference<DocumentData>
): [GameData | undefined, Dispatch<SetStateAction<GameData | undefined>>] {
  const [gameData, setGameData] = useState<GameData | undefined>();

  useEffect(() => {
    if (initialGameData && docRef) {
      setGameData(initialGameData);
      const unsubscribe = onSnapshot(docRef, (doc) => {
        const newData = doc.data() as GameStore | undefined;
        if (!newData) {
          // game expired
          // TODO: handle this
          setGameData(undefined);
          return;
        }

        const moves: Move[] = JSON.parse(newData.moves);
        const lastMove = moves[moves.length - 1];

        setGameData((oldGameData) => {
          let newGame = oldGameData!.game;
          if (newData.turn === newGame.color && !newData.winner && lastMove) {
            // opponent made a move
            newGame = playMove(
              newGame,
              newGame.color === "White" ? lastMove : flipMove(lastMove)
            );
          } else if (!lastMove) {
            // rematch initiated
            newGame = initializeGame(newGame.color, []);
          }

          return {
            isTurn: newData.turn === newGame.color,
            winner: newData.winner,
            rematch: newData.rematch,
            pastMoves: moves,
            game: newGame,
          };
        });
      });
      return () => unsubscribe();
    }
  }, [docRef, initialGameData, setGameData]);

  return [gameData, setGameData];
}
