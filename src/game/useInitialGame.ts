import { getAuth } from "firebase/auth";
import { DocumentReference, DocumentData } from "firebase/firestore";
import { firestore } from "../firebase/clientApp";
import React, { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { GameData } from "../pages/games/[code]";
import { updateAndRetrieveGameInfo } from "../firebase/utils";

const auth = getAuth(firestore.app);

function useInitialGame(code: string): {
  data?: GameData;
  docRef?: DocumentReference<DocumentData>;
  fail?: boolean;
} {
  const [user] = useAuthState(auth);
  const [data, setdata] = React.useState<GameData>();
  const [docRef, setdocRef] = React.useState<DocumentReference<DocumentData>>();
  const [fail, setFail] = React.useState<boolean>(false);

  useEffect(() => {
    if (user) {
      const initialize = async () => {
        const data = await updateAndRetrieveGameInfo(code, user);
        if (data == null) {
          setFail(true);
          return;
        }
        const [initialData, docRef] = data;
        setdata(initialData);
        setdocRef(docRef);
      };
      initialize();
    }
  }, [user, code]);

  return { data, docRef, fail };
}

export default useInitialGame;
