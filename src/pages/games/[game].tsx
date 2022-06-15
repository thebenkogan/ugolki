import type { NextPage } from "next";
import Head from "next/head";
import React from "react";
import Board from "../../components/Board";
import { initializeGame } from "../../game/game";
import { Game } from "../../types";
import { firestore } from "../../../firebase/clientApp";
import { collection, getDocs } from "firebase/firestore";

const Home: NextPage = () => {
  const [game, setGame] = React.useState<Game>(initializeGame("Black"));

  return (
    <div className="flex flex-col h-screen overflow-x-hidden">
      <Head>
        <title>Ugolki</title>
        <meta name="description" content="Ugolki" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="text-center font-bold text-6xl my-5">Ugolki</h1>
      <Board game={game} setGame={setGame} />
    </div>
  );
};

export default Home;
