import type { NextPage } from "next";
import Head from "next/head";
import Board from "../components/Board";
import { Grid } from "../types";

const START_BOARD: Grid = [
  [null, null, null, null, "White", "White", "White", "White"],
  [null, null, null, null, "White", "White", "White", "White"],
  [null, null, null, null, "White", "White", "White", "White"],
  [null, null, null, null, "White", "White", "White", "White"],
  ["Black", "Black", "Black", "Black", null, null, null, null],
  ["Black", "Black", "Black", "Black", null, null, null, null],
  ["Black", "Black", "Black", "Black", null, null, null, null],
  ["Black", "Black", "Black", "Black", null, null, null, null],
];

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Ugolki</title>
        <meta name="description" content="Ugolki" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="text-center font-bold text-8xl mt-10">Ugolki</h1>
      <Board board={START_BOARD} />
    </div>
  );
};

export default Home;
