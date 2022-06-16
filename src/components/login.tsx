import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import React from "react";
import { firestore } from "../../firebase/clientApp";

const auth = getAuth(firestore.app);

function Login(): JSX.Element {
  const signIn = () => {
    signInWithPopup(auth, new GoogleAuthProvider()).catch(alert);
  };

  return (
    <div>
      <button onClick={signIn}>Sign in with Google</button>
    </div>
  );
}

export default Login;
