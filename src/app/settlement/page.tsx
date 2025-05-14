// src/app/settlement/page.tsx
"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";

interface ExpenseRaw {
  amount: number;
  paidBy: string;   // UID
  settled: boolean;
  pairId: string;
}

interface Settlement {
  fromUid: string;
  toUid: string;
  fromName: string;
  toName: string;
  amount: number;
}

export default function SettlementPage() {
  const { user } = useUser() || {};
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.pairId) return;

    const fetchData = async () => {
      setLoading(true);

      // 1) ペアのユーザー一覧取得 → UID→名前マップ
      const usersSnap = await getDocs(
        query(collection(db, "users"), where("pairId", "==", user.pairId))
      );
      const nameMap: Record<string, string> = {};
      usersSnap.docs.forEach((d) => {
        nameMap[d.id] = d.data().name;
      });

      // 2) 未精算費用取得
      const expSnap = await getDocs(
        query(
          collection(db, "expenses"),
          where("pairId", "==", user.pairId),
          where("settled", "==", false)
        )
      );
      const raw = expSnap.docs.map((d) => d.data() as ExpenseRaw);

      // 3) 支払者毎の合計
      const totals: Record<string, number> = {};
      raw.forEach((e) => {
        totals[e.paidBy] = (totals[e.paidBy] || 0) + e.amount;
      });

      const members = Object.keys(totals);
      const sum = Object.values(totals).reduce((a, b) => a + b, 0);
      const avg = sum / members.length;

      // 4) 各メンバーの収支
      const balance: Record<string, number> = {};
      members.forEach((uid) => {
        balance[uid] = Math.round(totals[uid] - avg);
      });

      // 5) 貪欲法で精算ペアを決定
      const payers = members.filter((uid) => balance[uid] < 0);
      const receivers = members.filter((uid) => balance[uid] > 0);
      const result: Settlement[] = [];
      let i = 0, j = 0;
      while (i < payers.length && j < receivers.length) {
        const p = payers[i];
        const r = receivers[j];
        const amt = Math.min(-balance[p], balance[r]);
        if (amt > 0) {
          result.push({
            fromUid: p,
            toUid: r,
            fromName: nameMap[p] || "不明",
            toName: nameMap[r] || "不明",
            amount: amt,
          });
          balance[p] += amt;
          balance[r] -= amt;
        }
        if (balance[p] === 0) i++;
        if (balance[r] === 0) j++;
      }

      setSettlements(result);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">ログイン情報を確認しています…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center bg-white px-6 py-10">
      <h1 className="text-2xl font-bold text-[#FF6B35] mb-6">清算の状況</h1>

      {loading ? (
        <p className="text-gray-500">読み込み中…</p>
      ) : settlements.length === 0 ? (
        <p className="text-gray-500">精算が必要な費用はありません</p>
      ) : (
        <div className="w-full max-w-md space-y-4">
          {settlements.map((s, idx) => {
            const isPayer = s.fromUid === user.uid;
            return (
              <div
                key={idx}
                className="bg-white p-4 rounded-xl shadow-sm"
              >
                {/* 誰が誰にいくら */}
                <p className="text-sm text-gray-700 mb-2">
                  {s.fromName} が {s.toName} に支払う金額
                </p>

                {/* 金額 */}
                <p className="text-3xl font-bold text-[#FF6B35] mb-4">
                  ¥{s.amount.toLocaleString()}
                </p>

                {/* アクションボタン */}
                {isPayer ? (
                  <Button className="w-full bg-[#FF6B35] hover:bg-[#e85d2d] text-white rounded-xl">
                    PayPayで支払う
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-[#00C300] hover:bg-green-600 text-white rounded-xl"
                  >
                    LINEで送金リンクを送る
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}