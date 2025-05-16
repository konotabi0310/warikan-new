// src/app/email-auth/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { sendSignInLinkToEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EmailAuthPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const actionCodeSettings = {
      url: `${window.location.origin}/verify`,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email);
      setSent(true);
    } catch (err) {
      console.error(err);
      setError("メール送信に失敗しました。アドレスを確認してください。");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-6 py-10">
      <h1 className="text-xl font-bold text-[#FF6B35] mb-4">
        新規登録（メール認証）
      </h1>

      {sent ? (
        <p className="text-center text-gray-600 max-w-xs">
          認証メールを送信しました。メール内のリンクを開くと次の登録画面に進みます。
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
          <label className="text-sm text-gray-700 block">メールアドレス</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="rounded-xl bg-white"
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            className="w-full bg-[#FF6B35] hover:bg-[#e85d2d] rounded-xl"
          >
            認証メールを送信
          </Button>
        </form>
      )}

      <p className="mt-6 text-sm">
        すでに認証済みの方は{" "}
        <Link href="/login" className="text-[#FF6B35] underline">
          ログイン
        </Link>
      </p>
    </main>
  );
}