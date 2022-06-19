import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import React from "react";
import { firestore } from "../../firebase/clientApp";
import Card from "./Card";

const auth = getAuth(firestore.app);

function Login(): JSX.Element {
  const signIn = () => {
    signInWithPopup(auth, new GoogleAuthProvider()).catch(alert);
  };

  return (
    <Card>
      <button
        className="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-4 rounded"
        onClick={signIn}
      >
        Sign In With Google
      </button>
    </Card>
  );
}

export default Login;
