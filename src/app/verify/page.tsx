"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function VerifyPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const email = window.localStorage.getItem("emailForSignIn");
    if (!email) {
      setError("メールアドレス情報が見つかりません。");
      return;
    }

    if (isSignInWithEmailLink(auth, window.location.href)) {
      signInWithEmailLink(auth, email, window.location.href)
        .then(() => {
          window.localStorage.removeItem("emailForSignIn");
          router.push("/register"); // ✅ UID取得後に登録画面へ
        })
        .catch((err) => {
          console.error("メールリンク認証失敗:", err);
          setError("認証リンクが無効です。");
        });
    }
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      {error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : (
        <p className="text-gray-600 text-sm">認証処理中です...</p>
      )}
    </main>
  );
}