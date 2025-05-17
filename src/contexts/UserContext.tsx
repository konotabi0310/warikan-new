// src/contexts/UserContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  User as FBUser,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export type UserType = {
  uid:      string;
  name:     string;
  username: string;
  email:    string;
  pairId:   string;
  avatarUrl?: string;
};

type ContextType = {
  user:    UserType | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<UserType | null>>;
};

const UserContext = createContext<ContextType | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user,    setUser]    = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // クライアントサイドで永続化を設定
    setPersistence(auth, browserLocalPersistence).catch(console.error);

    // 認証状態の監視
    const unsub = onAuthStateChanged(auth, async (fbUser: FBUser | null) => {
      if (fbUser) {
        try {
          const snap = await getDoc(doc(db, "users", fbUser.uid));
          if (snap.exists()) {
            setUser({ uid: fbUser.uid, ...(snap.data() as any) });
          } else {
            setUser(null);
          }
        } catch (err) {
          console.error("Firestore 取得エラー:", err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be inside UserProvider");
  return ctx;
};