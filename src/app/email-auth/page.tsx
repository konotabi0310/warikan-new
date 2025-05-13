"use client";

import { useState } from "react";
import { sendSignInLinkToEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function EmailAuthPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const actionCodeSettings = {
      url: `${window.location.origin}/verify`,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email);
      setSent(true);
    } catch (error) {
      console.error("認証メールの送信に失敗しました:", error);
      alert("メール送信に失敗しました。アドレスをご確認ください。");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-white">
      <h1 className="text-xl font-bold text-[#FF6B35] mb-4">
        新規登録（メール認証）
      </h1>

      {sent ? (
        <p className="text-sm text-gray-600 text-center max-w-xs">
          メールを送信しました。メール内のリンクをクリックして認証を完了してください。
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
          <label className="text-sm text-gray-700 block">メールアドレス</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="rounded-xl"
            required
          />

          <Button type="submit" className="w-full bg-[#FF6B35] hover:bg-[#e85d2d] rounded-xl">
            <Mail className="w-4 h-4 mr-2" />
            認証メールを送信
          </Button>
        </form>
      )}
    </main>
  );
}