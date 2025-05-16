// src/app/verify/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function VerifyPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const storedEmail = window.localStorage.getItem("emailForSignIn");
    const currentUrl  = window.location.href;

    if (storedEmail && isSignInWithEmailLink(auth, currentUrl)) {
      signInWithEmailLink(auth, storedEmail, currentUrl)
        .then(() => {
          window.localStorage.removeItem("emailForSignIn");
          router.push("/register");
        })
        .catch((err) => {
          console.error("メールリンク認証失敗:", err);
          setError("認証リンクが無効です。再度お試しください。");
        });
    } else {
      setError("メールアドレス情報が見つかりません。");
    }
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6">
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <p className="text-gray-600">認証処理中…</p>
      )}
    </main>
  );
}