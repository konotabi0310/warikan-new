"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/contexts/UserContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const userContext = useUser(); // null 対策
  const setUser = userContext?.setUser;

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  // Contextが未定義のときの保険
  if (!setUser) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500 text-sm">ユーザー情報を初期化できません。</p>
      </main>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !username) {
      setError("すべての項目を入力してください");
      return;
    }

    try {
      const q = query(
        collection(db, "users"),
        where("email", "==", email),
        where("username", "==", username)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError("一致するユーザーが見つかりませんでした");
        return;
      }

      const doc = snapshot.docs[0];
      const userData = doc.data();

      // Contextにログイン情報をセット
      setUser({
        id: doc.id,
        name: userData.name,
        username: userData.username,
        email: userData.email,
        pairId: userData.pairId,
      });

      // ホームに遷移
     // 精算画面に遷移
router.push("/settlement");
    } catch (err) {
      console.error("ログイン失敗:", err);
      setError("ログイン中にエラーが発生しました");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-white">
      <h1 className="text-xl font-bold text-[#FF6B35] mb-6">ログイン</h1>

      <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
        <div>
          <label className="text-sm text-gray-700 block">メールアドレス</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="text-sm text-gray-700 block">ユーザー名</label>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="例：moeka123"
            required
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button
          type="submit"
          className="w-full bg-[#FF6B35] hover:bg-[#e85d2d] rounded-xl"
        >
          ログインする
        </Button>
      </form>
    </main>
  );
}