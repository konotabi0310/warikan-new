"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

type Expense = {
  id: string;
  amount: number;
  category: string;
  date: string;
  paidBy: string;
  settled: boolean;
};

export default function ExpenseListPage() {
  const { user } = useUser() || {};
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchExpenses = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "expenses"),
          where("payId", "==", user.pairId),
          orderBy("date", "desc")
        );
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Expense[];

        setExpenses(list);
      } catch (err) {
        console.error("費用の取得に失敗しました", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [user]);

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500 text-sm">ログイン情報を確認しています...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 bg-[#FAFAF8]">
      <h1 className="text-xl font-bold text-[#FF6B35] mb-4">費用一覧</h1>

      {loading ? (
        <p className="text-sm text-gray-500">読み込み中...</p>
      ) : expenses.length === 0 ? (
        <p className="text-sm text-gray-500">まだ費用が登録されていません</p>
      ) : (
        <ul className="space-y-3">
          {expenses.map((exp) => (
            <li
              key={exp.id}
              className="bg-white p-4 rounded-xl shadow-sm border"
            >
              <div className="flex justify-between text-sm font-medium">
                <span>{exp.category}</span>
                <span>¥{exp.amount.toLocaleString()}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {exp.date} / 支払者: {exp.paidBy}
              </div>
              {exp.settled && (
                <div className="text-xs text-green-600 mt-1">精算済み</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}