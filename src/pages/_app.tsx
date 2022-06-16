import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useAuthState } from "react-firebase-hooks/auth";
import { firestore } from "../../firebase/clientApp";
import { getAuth } from "firebase/auth";
import Login from "../components/login";

function MyApp({ Component, pageProps }: AppProps) {
  const [user] = useAuthState(getAuth(firestore.app));

  if (!user) return <Login />;

  return (
    <div className="bg-slate-700">
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
