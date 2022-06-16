import type { NextPage } from "next";
import Head from "next/head";
import React from "react";
import Board from "../components/Board";
import { initializeGame } from "../game/game";
import { Game } from "../types";
import GameForm from "../components/GameForm";
import Login from "../components/login";
import { getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { firestore } from "../../firebase/clientApp";

const Home: NextPage = () => {
  const [user, loading] = useAuthState(getAuth(firestore.app));
  const content = user ? <GameForm /> : <Login loading={loading} />;
  return (
    <div className="flex flex-col h-screen overflow-x-hidden">
      <Head>
        <title>Ugolki</title>
        <meta name="description" content="Ugolki" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="text-center font-bold text-6xl my-5">Ugolki</h1>
      {content}
    </div>
  );
};

export default Home;
