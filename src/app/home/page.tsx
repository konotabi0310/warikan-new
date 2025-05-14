// src/app/home/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUser } from "@/contexts/UserContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";

export default function HomePage() {
  const router = useRouter();
  const { user } = useUser() || {};
  const [earliestUnsettled, setEarliestUnsettled] = useState<string | null>(null);

  // 未ログインならログイン画面へ
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // 未精算の費用から最も古い日付を取得
  useEffect(() => {
    if (!user?.pairId) return;

    const fetchEarliest = async () => {
      const q = query(
        collection(db, "expenses"),
        where("payId", "==", user.pairId),
        where("settled", "==", false),
        orderBy("date", "asc"),
        // Firestore のクエリでは orderBy だけだと複合インデックスが要る場合があるので、
        // 必要に応じてインデックスを作成してください。
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const first = snap.docs[0].data().date as string;
        setEarliestUnsettled(first);
      }
    };

    fetchEarliest();
  }, [user]);

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm text-gray-500">ログイン情報を確認中です...</p>
      </main>
    );
  }

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
        <h1 className="text-2xl font-bold text-[#FF6B35]">{user.name}さん、こんにちは！</h1>
      </div>

      {/* ペアコード表示 */}
      <p className="text-sm text-gray-600 mb-6 text-center">
        ペアコード：<span className="font-mono">{user.pairId}</span>
      </p>

      {/* 未精算開始日 */}
      {earliestUnsettled && (
        <p className="text-sm text-red-600 mb-6">
          {format(parseISO(earliestUnsettled), "M月d日")}から費用が精算されていません
        </p>
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