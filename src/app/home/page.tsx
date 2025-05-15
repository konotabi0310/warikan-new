// src/app/home/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUser } from "@/contexts/UserContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";

export default function HomePage() {
  const router = useRouter();
  // 🔥 loading も受け取る
  const { user, loading } = useUser();
  const [earliestUnsettled, setEarliestUnsettled] = useState<string | null>(null);

  // 認証読み込み完了後に未ログインなら /login へ
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // 未精算の費用から最古日を算出
  useEffect(() => {
    if (!user?.pairId) return;

    (async () => {
      const snap = await getDocs(
        query(
          collection(db, "expenses"),
          where("pairId", "==", user.pairId),
          where("settled", "==", false)
        )
      );
      if (snap.empty) {
        setEarliestUnsettled(null);
      } else {
        const dates = snap.docs.map(d => d.data().date as string);
        // 最も古い文字列を取る
        setEarliestUnsettled(dates.sort()[0]);
      }
    })();
  }, [user]);

  // 🔥 読み込み中 or user がまだ決まらない間は「確認中…」を表示
  if (loading || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">ログイン情報を確認中…</p>
      </main>
    );
  }

  // ここから user が確実に存在するホーム画面
  return (
    <main className="min-h-screen bg-[#FAFAF8] px-6 py-10 flex flex-col items-center">
      {/* ヘッダー */}
      <div className="flex items-center space-x-3 mb-6">
        {user.avatarUrl ? (
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#FF6B35]">
            <Image
              src={user.avatarUrl}
              alt="ユーザーアイコン"
              width={48}
              height={48}
              className="object-cover w-full h-full"
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center border-2 border-[#FF6B35]">
            <span className="text-gray-500">?</span>
          </div>
        )}
        <h1 className="text-2xl font-bold text-[#FF6B35]">
          {user.name}さん、こんにちは！
        </h1>
      </div>

      {/* ペアコード表示 */}
      <p className="text-sm text-gray-600 mb-6 text-center">
        ペアコード：<span className="font-mono">{user.pairId}</span>
      </p>

      {/* 未精算開始日カード */}
      {earliestUnsettled && (
        <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-6 mb-6 text-center">
          <p className="text-3xl font-extrabold text-[#FF6B35]">
            {format(parseISO(earliestUnsettled), "M月d日")}
          </p>
          <p className="mt-2 text-lg font-semibold text-gray-800">
            から費用が精算されていません
          </p>
        </div>
      )}

      {/* ボタン横並び */}
      <div className="flex w-full max-w-xs gap-4">
        <Button
          className="flex-1 bg-[#FF6B35] hover:bg-[#e85d2d] text-white rounded-xl"
          onClick={() => router.push("/expense/new")}
        >
          費用を追加する
        </Button>
        <Button
          variant="outline"
          className="flex-1 text-[#FF6B35] border-[#FF6B35] hover:bg-[#FFF4F0] rounded-xl"
          onClick={() => router.push("/settlement")}
        >
          精算する
        </Button>
      </div>
    </main>
  );
}