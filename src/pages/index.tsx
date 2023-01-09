import type { NextPage } from "next";
import Head from "next/head";
import React from "react";
import GameForm from "../components/GameForm";
import { getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { firestore } from "../firebase/clientApp";
import Login from "../components/Login";
import Loading from "../components/Loading";
import Header from "../components/Header";
import { addUser } from "../firebase/users";

let userAdded = false;

const Home: NextPage = () => {
  const [user, loading] = useAuthState(getAuth(firestore.app));
  if (user && !userAdded) {
    addUser(user);
    userAdded = true;
  }
  const content = user ? <GameForm /> : loading ? <Loading /> : <Login />;
  return (
    <div className="flex flex-col h-screen overflow-x-hidden">
      <Head>
        <title>Ugolki</title>
        <meta name="description" content="Ugolki" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      {content}
    </div>
  );
};

export default Home;
