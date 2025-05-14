"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

// ユーザー型
type UserType = {
  uid: string;
  name: string;
  payId: string;
  avatarUrl?: string;
  email?: string;
  username?: string;
  pairId?: string;
};

// Context型
type UserContextType = {
  user: UserType | null;
  setUser: React.Dispatch<React.SetStateAction<UserType | null>>;
};

// Context定義
const UserContext = createContext<UserContextType | null>(null);

// Providerコンポーネント
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    console.log("✅ useEffect in UserContext is running!");

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      console.log("🟡 onAuthStateChanged fired:", fbUser);

      if (fbUser?.email) {
        try {
          const q = query(
            collection(db, "users"),
            where("email", "==", fbUser.email)
          );
          const snap = await getDocs(q);
          console.log("🟢 Firestore user doc count:", snap.size);

          if (!snap.empty) {
            const docData = snap.docs[0].data();
            console.log("🟣 Firestore user data:", docData);

            setUser({
              uid: fbUser.uid,
              name: docData.name,
              payId: docData.payId,
              pairId: docData.pairId,
              avatarUrl: docData.avatarUrl,
              email: docData.email,
              username: docData.username,
            });
          } else {
            console.warn("⚠️ Firestore に一致するユーザーが見つかりません");
          }
        } catch (error) {
          console.error("❌ Firestore クエリ失敗:", error);
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

// 呼び出し用フック
export const useUser = () => useContext(UserContext);