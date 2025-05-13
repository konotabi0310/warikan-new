"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";

interface Expense {
  amount: number;
  paidBy: string;
  settled: boolean;
  pairId: string;
}

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export default function SettlementPage() {
  const userContext = useUser(); // null 対策
  const user = userContext?.user;
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔒 ユーザー情報が未取得なら一時表示
  if (!user?.name || !user?.pairId) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500 text-sm">ユーザー情報を読み込んでいます...</p>
      </main>
    );
  }

  // 🔄 Firestoreから未精算データを取得して精算ロジックを実行
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const q = query(
        collection(db, "expenses"),
        where("pairId", "==", user.pairId),
        where("settled", "==", false)
      );
      const snapshot = await getDocs(q);
      const data: Expense[] = snapshot.docs.map((doc) => doc.data() as Expense);

      // 支払者ごとの合計金額を計算
      const totals: Record<string, number> = {};
      data.forEach((e) => {
        totals[e.paidBy] = (totals[e.paidBy] || 0) + e.amount;
      });

      const members = Object.keys(totals);
      const totalAmount = Object.values(totals).reduce((a, b) => a + b, 0);
      const avg = totalAmount / members.length;

      const balance: Record<string, number> = {};
      members.forEach((name) => {
        balance[name] = Math.round(totals[name] - avg);
      });

      // 精算ロジック（貪欲法）
      const payers = members.filter((n) => balance[n] < 0);
      const receivers = members.filter((n) => balance[n] > 0);
      const result: Settlement[] = [];

      let i = 0, j = 0;
      while (i < payers.length && j < receivers.length) {
        const payer = payers[i];
        const receiver = receivers[j];
        const payAmount = Math.min(-balance[payer], balance[receiver]);

        if (payAmount > 0) {
          result.push({ from: payer, to: receiver, amount: payAmount });
          balance[payer] += payAmount;
          balance[receiver] -= payAmount;
        }

        if (balance[payer] === 0) i++;
        if (balance[receiver] === 0) j++;
      }

      setSettlements(result);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  return (
    <main className="min-h-screen bg-[#FAFAF8] px-4 py-6">
      <h1 className="text-xl font-bold text-center mb-4 text-[#FF6B35]">
        清算の状況
      </h1>

      {loading ? (
        <p className="text-center text-sm text-gray-500">読み込み中...</p>
      ) : settlements.length === 0 ? (
        <p className="text-center text-sm text-gray-500 mt-10">
          精算が必要な費用はありません
        </p>
      ) : (
        <div className="space-y-4">
          {settlements.map((item, index) => {
            const isPayer = item.from === user.name;

            return (
              <div
                key={index}
                className="bg-white p-4 rounded-xl shadow flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-700">
                    {item.from} → {item.to}
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      isPayer ? "text-[#FF6B35]" : "text-green-600"
                    }`}
                  >
                    ¥{item.amount.toLocaleString()}
                  </div>
                </div>

                {/* 支払 or 受取ボタン */}
                {isPayer ? (
                  <Button className="bg-[#FF6B35] hover:bg-[#e85d2d] w-full rounded-xl text-white">
                    PayPayで支払う
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full rounded-xl text-[#FF6B35] border-[#FF6B35]"
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