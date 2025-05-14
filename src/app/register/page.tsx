"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, query, where, collection, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useUser } from "@/contexts/UserContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [pairCode, setPairCode] = useState("");
  const [mode, setMode] = useState<"create" | "join">("create");
  const [error, setError] = useState("");
  const router = useRouter();

  const userContext = useUser();
  const setUser = userContext?.setUser;

  const [uid, setUid] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUid(currentUser.uid);
      setEmail(currentUser.email ?? "");
    } else {
      setError("メール認証が完了していません");
    }
  }, []);

  const handleSubmit = async () => {
    if (!name || !username || !pairCode || !uid || !email) {
      setError("すべての項目を入力してください");
      return;
    }

    // 🔍 ユーザー名の重複チェック
    const q = query(collection(db, "users"), where("username", "==", username));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      setError("そのユーザー名はすでに使われています");
      return;
    }

    const newUser = {
      name,
      username,
      email,
      pairId: pairCode,
    };

    // ✅ UIDを指定して保存
    await setDoc(doc(db, "users", uid), newUser);

    // 🌱 Contextにセット
    setUser({
      uid,
      ...newUser,
    });

    // ✅ ホーム画面に遷移
    router.push("/home");
  };

  if (!setUser) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500 text-sm">ユーザー情報の初期化に失敗しました</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8] px-6 py-10 flex flex-col items-center">
      <h1 className="text-2xl font-bold text-[#FF6B35] mb-6">登録情報の入力</h1>

      <div className="w-full max-w-sm space-y-4 bg-white p-6 rounded-xl shadow">
        <div>
          <label className="text-sm text-gray-700">あなたの名前（表示名）</label>
          <Input
            className="mt-1 rounded-xl bg-white"
            placeholder="例：もえか"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-gray-700">ユーザー名（ログインID）</label>
          <Input
            className="mt-1 rounded-xl bg-white"
            placeholder="例：moeka123"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="flex gap-4 text-sm text-gray-700">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="mode"
              value="create"
              checked={mode === "create"}
              onChange={() => setMode("create")}
            />
            ペアコードを作成
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="mode"
              value="join"
              checked={mode === "join"}
              onChange={() => setMode("join")}
            />
            ペアコードに参加
          </label>
        </div>

        <div>
          <label className="text-sm text-gray-700">
            {mode === "create" ? "作成するペアコード" : "参加するペアコード"}
          </label>
          <Input
            className="mt-1 rounded-xl bg-white"
            placeholder="例：love123"
            value={pairCode}
            onChange={(e) => setPairCode(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button
          onClick={handleSubmit}
          className="w-full mt-4 rounded-xl bg-[#FF6B35] hover:bg-[#e85d2d]"
        >
          登録してはじめる
        </Button>
      </div>
    </main>
  );
}