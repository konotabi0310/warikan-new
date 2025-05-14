"use client";

import { useState } from "react";
import { sendSignInLinkToEmail } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function EmailAuthPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        setError("このメールアドレスは既に使用されています。");
        return;
      }

      const actionCodeSettings = {
        url: `${window.location.origin}/verify`,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email);
      setSent(true);
    } catch (err) {
      console.error("認証メールの送信に失敗しました:", err);
      setError("メール送信に失敗しました。アドレスをご確認ください。");
    }
  };

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-10">
      <div className="flex flex-col items-center mb-8">
        <img src="/logo.png" alt="ラクワリ ロゴ" width={80} height={80} className="mb-2" />
        <h1 className="text-2xl font-bold text-[#FF6B35]">ラクワリ</h1>
        <p className="text-sm text-gray-500">メール認証からはじめよう</p>
      </div>

      <div className="w-full max-w-sm p-6 rounded-xl shadow border space-y-4 bg-white">
        {sent ? (
          <p className="text-sm text-center text-gray-600">
            メールを送信しました。<br />
            リンクをクリックして認証を完了してください。
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="text-sm text-gray-700 block">メールアドレス</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-xl"
              required
            />

            {error && (
              <div className="text-sm text-red-500 space-y-1">
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="text-sm text-[#FF6B35] underline mt-1"
                >
                  → ログイン画面へ
                </button>
              </div>
            )}

            <Button type="submit" className="w-full bg-[#FF6B35] hover:bg-[#e85d2d] rounded-xl">
              <Mail className="w-4 h-4 mr-2" />
              認証メールを送信
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}