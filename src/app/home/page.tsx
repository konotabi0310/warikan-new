"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();
  const userContext = useUser();
  const user = userContext?.user;

  // 未ログインならリダイレクト
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm text-gray-500">ログイン情報を確認中です...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8] px-6 py-10 flex flex-col items-center">
      <h1 className="text-2xl font-bold text-[#FF6B35] mb-4">
        {user.name}さん、こんにちは！
      </h1>

      <p className="text-sm text-gray-600 mb-6 text-center">
        ペアコード：<span className="font-mono">{user.pairId}</span>
      </p>

      <div className="w-full max-w-xs space-y-4">
        <Button
          className="w-full bg-[#FF6B35] hover:bg-[#e85d2d] text-white rounded-xl"
          onClick={() => router.push("/expense/new")}
        >
          費用を追加する
        </Button>

        <Button
          variant="outline"
          className="w-full text-[#FF6B35] border-[#FF6B35] hover:bg-[#FFF4F0] rounded-xl"
          onClick={() => router.push("/settlement")}
        >
          精算する
        </Button>
      </div>
    </main>
  );
}