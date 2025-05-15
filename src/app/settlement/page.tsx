// src/app/settlement/page.tsx
"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
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

    // 1) ユーザー一覧をリアルタイム取得して名前マップを作成
    const usersQ = query(
      collection(db, "users"),
      where("pairId", "==", user.pairId)
    );
    let nameMap: Record<string, string> = {};
    const unsubUsers = onSnapshot(usersQ, (snap) => {
      snap.docs.forEach((d) => {
        nameMap[d.id] = d.data().name as string;
      });
    });

    // 2) 未精算の expenses をリアルタイムで監視
    const expQ = query(
      collection(db, "expenses"),
      where("pairId", "==", user.pairId),
      where("settled", "==", false)
    );
    const unsubExp = onSnapshot(expQ, (snap) => {
      const raw = snap.docs.map((d) => d.data() as ExpenseRaw);

      // 支払者ごとの合計
      const totals: Record<string, number> = {};
      raw.forEach((e) => {
        totals[e.paidBy] = (totals[e.paidBy] || 0) + e.amount;
      });

      const members = Object.keys(totals);
      const sum = Object.values(totals).reduce((a, b) => a + b, 0);
      const avg = sum / members.length;

      // 各自の収支
      const balance: Record<string, number> = {};
      members.forEach((uid) => {
        balance[uid] = Math.round(totals[uid] - avg);
      });

      // 貪欲法で「誰が誰にいくら払うか」を決定
      const payers = members.filter((uid) => balance[uid] < 0);
      const receivers = members.filter((uid) => balance[uid] > 0);
      const result: Settlement[] = [];
      let i = 0,
        j = 0;
      while (i < payers.length && j < receivers.length) {
        const p = payers[i],
          r = receivers[j];
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

            // 共有メッセージを準備
            const text = isPayer
              ? `${s.fromName}さんは ${s.toName}さんに¥${s.amount.toLocaleString()}を送金してください。`
              : `${s.toName}さんは ${s.fromName}さんから¥${s.amount.toLocaleString()}を受け取ってください。`;

            // LINE 共有用 URL
            const lineShareUrl = `https://line.me/R/msg/text/?${encodeURIComponent(
              text
            )}`;

            // PayPay 起動用 Deep Link (サンプル)
            const paypayLink = `paypay://send?amount=${s.amount}`;

            return (
              <div key={idx} className="bg-white p-4 rounded-xl shadow-sm">
                <p className="text-lg text-gray-800 mb-2">{text}</p>

                <div className="flex gap-3">
                  {isPayer ? (
                    <Button
                      className="flex-1 bg-[#ED1C24] hover:bg-[#c1121f] text-white rounded-xl"
                      onClick={() => {
                        // PayPay アプリへ遷移
                        window.location.href = paypayLink;
                      }}
                    >
                      PayPay 起動
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 bg-[#00C300] hover:bg-green-600 text-white rounded-xl"
                      onClick={() => {
                        // LINE シェアシートを呼び出し
                        window.open(lineShareUrl, "_blank");
                      }}
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