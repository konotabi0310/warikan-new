// src/app/settlement/page.tsx
"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";

interface ExpenseRaw {
  amount: number;
  paidBy: string;   // UID of payer
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
    setLoading(true);

    // 1) ペア全ユーザーの取得（名前マップ & UID リスト）
    const usersQ = query(
      collection(db, "users"),
      where("pairId", "==", user.pairId)
    );
    let nameMap: Record<string, string> = {};
    let memberUids: string[] = [];
    const unsubUsers = onSnapshot(usersQ, (snap) => {
      memberUids = snap.docs.map((d) => {
        const uid = d.id;
        nameMap[uid] = (d.data().name as string) || "不明";
        return uid;
      });
    });

    // 2) 未精算費用のリアルタイム監視
    const expQ = query(
      collection(db, "expenses"),
      where("pairId", "==", user.pairId),
      where("settled", "==", false)
    );
    const unsubExp = onSnapshot(expQ, (snap) => {
      // 未精算費用を配列化
      const raw = snap.docs.map((d) => d.data() as ExpenseRaw);

      // 3) totals を「全メンバーで 0 初期化」
      const totals: Record<string, number> = {};
      memberUids.forEach((uid) => {
        totals[uid] = 0;
      });

      // 4) 未精算費用を加算
      raw.forEach((e) => {
        if (totals[e.paidBy] != null) {
          totals[e.paidBy] += e.amount;
        }
      });

      const members = memberUids; // 全メンバー
      const sum = Object.values(totals).reduce((a, b) => a + b, 0);
      const avg = sum / members.length;

      // 5) 各自の収支 balance 計算
      const balance: Record<string, number> = {};
      members.forEach((uid) => {
        balance[uid] = Math.round(totals[uid] - avg);
      });

      // 6) 貪欲法で決定
      const payers = members.filter((uid) => balance[uid] < 0);
      const receivers = members.filter((uid) => balance[uid] > 0);
      const result: Settlement[] = [];
      let i = 0, j = 0;
      while (i < payers.length && j < receivers.length) {
        const p = payers[i], r = receivers[j];
        const amt = Math.min(-balance[p], balance[r]);
        if (amt > 0) {
          result.push({
            fromUid: p,
            toUid: r,
            fromName: nameMap[p],
            toName: nameMap[r],
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
    });

    return () => {
      unsubUsers();
      unsubExp();
    };
  }, [user]);

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">ログイン情報を確認しています…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8] px-6 py-10 flex flex-col items-center">
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
                className="bg-white p-4 rounded-xl shadow flex flex-col gap-4"
              >
                {isPayer ? (
                  <p className="text-lg text-gray-800">
                    あなたは <span className="text-[#FF6B35]">{s.toName}</span> さんに
                    <span className="ml-1 text-2xl font-bold text-[#FF6B35]">
                      ¥{s.amount.toLocaleString()}
                    </span> を送るべきです
                  </p>
                ) : (
                  <p className="text-lg text-gray-800">
                    <span className="text-[#FF6B35]">{s.fromName}</span> さんが
                    あなたに
                    <span className="ml-1 text-2xl font-bold text-[#FF6B35]">
                      ¥{s.amount.toLocaleString()}
                    </span> を送るべきです
                  </p>
                )}
                <div className="flex gap-3">
                  {isPayer ? (
                    <Button
                      className="flex-1 bg-[#ED1C24] hover:bg-[#c1121f] text-white rounded-xl"
                    >
                      PayPay を起動
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 bg-[#00C300] hover:bg-green-600 text-white rounded-xl"
                    >
                      LINE 送金リンク
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}