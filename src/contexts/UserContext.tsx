"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// Contextで共有する型（user と setUser 両方含む）
type UserContextType = {
  user: {
    uid: string;
    name: string;
    payId: string;
    avatarUrl?: string;
    email?: string;
    username?: string;
    pairId?: string;
  } | null;
  setUser: React.Dispatch<React.SetStateAction<UserContextType["user"]>>;
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserContextType["user"]>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const docSnap = await getDoc(doc(db, "users", fbUser.uid));
        if (docSnap.exists()) {
          setUser({ uid: fbUser.uid, ...docSnap.data() } as UserContextType["user"]);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// 呼び出し側で { user, setUser } を取得可能に
export const useUser = () => useContext(UserContext);