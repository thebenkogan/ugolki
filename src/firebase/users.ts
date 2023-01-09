import { getAuth, User } from "firebase/auth";
import {
  collection,
  doc,
  DocumentData,
  DocumentReference,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import React, { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { GameData } from "../pages/games/[code]";
import { firestore } from "./clientApp";
import { updateAndRetrieveGameInfo } from "./games";

const auth = getAuth(firestore.app);

const defaultPhotoURL = "http://www.gravatar.com/avatar/?d=mp";

export type Rival = {
  opp: GameUser;
  wins: number;
  losses: number;
};

export type GameUser = {
  name: string;
  photoURL: string;
};

export type GameUserWithRivals = GameUser & {
  rivals: Rival[];
};

/**
 * Adds the user to the database if they do not already exist.
 *
 * @param user The current active user
 */
export async function addUser(user: User) {
  await setDoc(doc(firestore, "users", user.uid), {
    name: user.displayName,
    photoURL: user.photoURL ?? defaultPhotoURL,
  });
}

export async function getUsersByIds(userIds: string[]): Promise<GameUser[]> {
  const users = await Promise.all(
    userIds.map(async (userId) => getDoc(doc(firestore, "users", userId)))
  );

  return users.map((user) => user.data() as GameUser);
}

async function getRivals(user: User): Promise<Rival[]> {
  const rivals = (
    await getDocs(collection(firestore, "users", user.uid, "rivals"))
  ).docs;

  const users = await getUsersByIds(rivals.map((doc) => doc.id));

  return rivals.map((doc, i) => ({
    opp: users[i],
    wins: doc.data().wins,
    losses: doc.data().losses,
  }));
}

export async function getGameUser(userId: string): Promise<GameUser> {
  return (await getDoc(doc(firestore, "users", userId))).data() as GameUser;
}

export async function getUserWithRivals(
  user: User
): Promise<GameUserWithRivals> {
  const gameUser = (
    await getDoc(doc(firestore, "users", user.uid))
  ).data() as GameUser;

  return {
    ...gameUser,
    rivals: await getRivals(user),
  };
}

export async function getRivalById(user: User, rivalId: string) {
  const rival = (
    await getDoc(doc(firestore, "users", user.uid, "rivals", rivalId))
  ).data() as Rival;

  const oppUser = (
    await getDoc(doc(firestore, "users", rivalId))
  ).data() as GameUser;

  return {
    oppName: oppUser.name,
    wins: rival.wins,
    losses: rival.losses,
  };
}

export async function createRivalry(id1: string, id2: string) {
  await setDoc(
    doc(firestore, "users", id1, "rivals", id2),
    {
      wins: 0,
      losses: 0,
    },
    { merge: true }
  );
  await setDoc(
    doc(firestore, "users", id2, "rivals", id1),
    {
      wins: 0,
      losses: 0,
    },
    { merge: true }
  );
}

export function useGameUser(userId: string | undefined): GameUser | undefined {
  const [data, setdata] = React.useState<GameUser>();

  useEffect(() => {
    if (userId) {
      const initialize = async () => setdata(await getGameUser(userId));
      initialize();
    }
  }, [userId]);

  return data;
}
