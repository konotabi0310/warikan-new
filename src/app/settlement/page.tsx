"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";

interface Expense {
  amount: number;
  paidBy: string; // UIDで保存されている
  settled: boolean;
  pairId: string;
}

interface Settlement {
  from: string; // UID
  to: string;   // UID
  amount: number;
}

export default function SettlementPage() {
  const { user } = useUser()!;
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [uidNameMap, setUidNameMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid || !user?.pairId) return;

    const fetchData = async () => {
      setLoading(true);

      try {
        // ユーザー名マップ取得
        const usersSnapshot = await getDocs(
          query(collection(db, "users"), where("pairId", "==", user.pairId))
        );
        const uidName: Record<string, string> = {};
        usersSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          uidName[data.uid] = data.name;
        });
        setUidNameMap(uidName);

        // 費用データ取得
        const q = query(
          collection(db, "expenses"),
          where("pairId", "==", user.pairId),
          where("settled", "==", false)
        );
        const snapshot = await getDocs(q);
        const data: Expense[] = snapshot.docs.map((doc) => doc.data() as Expense);

        // 合計金額計算
        const totals: Record<string, number> = {};
        data.forEach((e) => {
          totals[e.paidBy] = (totals[e.paidBy] || 0) + e.amount;
        });

        const members = Object.keys(totals);
        const totalAmount = Object.values(totals).reduce((a, b) => a + b, 0);
        const avg = totalAmount / members.length;

        const balance: Record<string, number> = {};
        members.forEach((uid) => {
          balance[uid] = Math.round(totals[uid] - avg);
        });

        const payers = members.filter((uid) => balance[uid] < 0);
        const receivers = members.filter((uid) => balance[uid] > 0);
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
      } catch (err) {
        console.error("清算データ取得エラー", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return (
    <main className="min-h-screen bg-[#FAFAF8] px-4 py-6">
      <h1 className="text-xl font-bold text-center mb-6 text-[#FF6B35]">
        清算の状況
      </h1>

      {!user?.uid || !user?.pairId ? (
        <p className="text-center text-sm text-gray-500">ユーザー情報を読み込んでいます...</p>
      ) : loading ? (
        <p className="text-center text-sm text-gray-500">読み込み中...</p>
      ) : settlements.length === 0 ? (
        <p className="text-center text-sm text-gray-500 mt-10">
          精算が必要な費用はありません
        </p>
      ) : (
        <div className="space-y-4">
          {settlements.map((item, index) => {
            const fromName = uidNameMap[item.from] || "不明なユーザー";
            const toName = uidNameMap[item.to] || "不明なユーザー";
            const isPayer = item.from === user.uid;

            return (
              <div
                key={index}
                className="bg-white p-4 rounded-xl shadow-md flex flex-col gap-3"
              >
                <div className="text-sm text-gray-600 text-center">
                  <span className="font-semibold text-gray-800">{fromName}</span> は{" "}
                  <span className="font-semibold text-gray-800">{toName}</span> に
                </div>

                <div className="text-center text-2xl font-bold text-[#FF6B35]">
                  ¥{item.amount.toLocaleString()}
                </div>

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