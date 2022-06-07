import type { NextPage } from "next";
import Head from "next/head";
import Board from "../components/Board";
import { calculateLegalMoves } from "../game/game";
import { Grid } from "../types";

const START_BOARD: Grid = [
  [null, null, null, null, "Black", "Black", "Black", "Black"],
  [null, null, null, null, "Black", "Black", "Black", "Black"],
  [null, null, null, null, "Black", "Black", "Black", "Black"],
  [null, null, null, null, "Black", "Black", "Black", "Black"],
  ["White", "White", "White", "White", null, null, null, null],
  ["White", "White", "White", "White", null, null, null, null],
  ["White", "White", "White", "White", null, null, null, null],
  ["White", "White", "White", "White", null, null, null, null],
];

const Home: NextPage = () => {
  console.log(
    calculateLegalMoves({ board: START_BOARD, currentPlayer: "White" })
  );
  return (
    <div className="flex flex-col h-screen overflow-x-hidden">
      <Head>
        <title>Ugolki</title>
        <meta name="description" content="Ugolki" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="text-center font-bold text-6xl my-5">Ugolki</h1>
      <Board board={START_BOARD} />
    </div>
  );
};

export default Home;
