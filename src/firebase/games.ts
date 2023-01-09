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
  QuerySnapshot,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { playMove, initializeGame, Player } from "../game/game";
import { flipMove, Move } from "../game/moves";
import { GameData } from "../pages/games/[code]";
import { firestore } from "./clientApp";
import { createRivalry } from "./users";

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

function getOppId(color: Player, white: string | null, black: string | null) {
  return color === "White" ? black || undefined : white || undefined;
}

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
    await getDocs(query(gamesCollection, where(documentId(), "==", code)))
  ).docs[0];
  if (!gameDoc) return null;
  const data = gameDoc.data() as GameStore;

  // update white or black player spots if empty and this player can fill it
  if (!data.white && user.uid !== data.black) {
    await updateDoc(gameDoc.ref, { white: user.uid });
    await createRivalry(user.uid, data.black!);
    data.white = user.uid;
  }
  if (!data.black && user.uid !== data.white) {
    await updateDoc(gameDoc.ref, { black: user.uid });
    await createRivalry(user.uid, data.white!);
    data.black = user.uid;
  }

  let color: Player = user.uid === data.white ? "White" : "Black";
  if (user.uid !== data.white && user.uid !== data.black) return null;

  let moves: Move[] = JSON.parse(data.moves);

  return [
    {
      oppId: getOppId(color, data.white, data.black),
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
  const router = useRouter();
  const [gameData, setGameData] = useState<GameData | undefined>();

  useEffect(() => {
    if (initialGameData && docRef) {
      setGameData(initialGameData);
      const unsubscribe = onSnapshot(docRef, (doc) => {
        const newData = doc.data() as GameStore | undefined;
        if (!newData) {
          // game expired
          router.push("/");
          return;
        }

        const moves: Move[] = JSON.parse(newData.moves);
        const lastMove = moves[moves.length - 1];

        setGameData((oldGameData) => {
          let newGame = oldGameData!.game;
          const oppId = getOppId(newGame.color, newData.white, newData.black);
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
            oppId,
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
  }, [docRef, initialGameData, router, setGameData]);

  return [gameData, setGameData];
}

/**
 * @param games snapshot of games collection
 * @returns Promise that resolves when all deletions of expired games are complete
 */
function cleanGames(games: QuerySnapshot<GameStore>) {
  const twoHoursAgo = new Date();
  twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
  const deletions: Promise<void>[] = [];
  games.forEach((game) => {
    if (game.data().timestamp.toDate() < twoHoursAgo) {
      deletions.push(deleteDoc(game.ref));
    }
  });
  return Promise.all(deletions);
}

/**
 * @param games snapshot of games collection
 * @returns 5 digit game code that is not currently in use
 */
function createGameCode(games: QuerySnapshot<GameStore>): string {
  let newCode = "";
  const generateCode = () => {
    newCode = ("" + Math.random()).substring(2, 7);
    if (games.docs.some((game) => game.id === newCode)) generateCode();
  };
  generateCode();
  return newCode;
}

/**
 * Creates a fresh game lobby with the user assigned to a random color.
 *
 * @param user The current active user
 * @returns The new game lobby code
 */
export async function createGame(user: User) {
  const games = (await getDocs(gamesCollection)) as QuerySnapshot<GameStore>;
  const newCode = createGameCode(games);
  await cleanGames(games);
  const color = Math.random() < 0.5 ? "White" : "Black";
  const initialData: GameStore = {
    moves: "[]",
    white: color === "White" ? user!.uid : null,
    black: color === "Black" ? user!.uid : null,
    turn: color,
    winner: null,
    rematch: null,
    timestamp: serverTimestamp() as Timestamp, // firestore converts it to a Timestamp
  };
  await setDoc(doc(gamesCollection, newCode), initialData);
  return newCode;
}

export async function isValidGameCode(code: string) {
  const games = (await getDocs(gamesCollection)) as QuerySnapshot<GameStore>;
  return games.docs.some((game) => game.id === code);
}

/**
 * @param gameData the updated game data with the new move played
 * @param docRef the game lobby document reference to update
 */
export async function sendMove(
  gameData: GameData,
  docRef: DocumentReference<DocumentData>
) {
  const playerColor = gameData.game.color;
  const moves =
    playerColor == "White"
      ? gameData.pastMoves
      : gameData.pastMoves.map(flipMove);
  await updateDoc(docRef, {
    moves: JSON.stringify(moves),
    turn: playerColor === "White" ? "Black" : "White",
    winner: gameData.winner,
    timestamp: serverTimestamp(),
  });
}
