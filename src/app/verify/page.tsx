"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function VerifyPage() {
  const [status, setStatus] = useState<"checking" | "success" | "error">("checking");
  const router = useRouter();

  useEffect(() => {
    const verifyEmail = async () => {
      if (typeof window === "undefined") return;

      const email = window.localStorage.getItem("emailForSignIn");
      const url = window.location.href;

      if (!email || !isSignInWithEmailLink(auth, url)) {
        setStatus("error");
        return;
      }

      try {
        await signInWithEmailLink(auth, email, url);
        window.localStorage.removeItem("emailForSignIn");
        setStatus("success");

        // 1秒待って register に遷移
        setTimeout(() => {
          router.push("/register");
        }, 1000);
      } catch (err) {
        console.error("認証失敗:", err);
        setStatus("error");
      }
    };

    verifyEmail();
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      {status === "checking" && (
        <p className="text-sm text-gray-500">認証リンクを確認しています...</p>
      )}
      {status === "success" && (
        <p className="text-sm text-green-600 font-medium">認証が完了しました。登録画面へ移動します。</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-500">
          認証に失敗しました。リンクが無効か、メール情報が見つかりません。
        </p>
      )}
    </main>
  );
}