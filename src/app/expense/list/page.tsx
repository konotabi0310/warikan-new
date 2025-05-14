"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";

type Expense = {
  id: string;
  amount: number;
  category: string;
  date: string;
  paidBy: string; // UID
  settled: boolean;
};

export default function ExpenseListPage() {
  const { user } = useUser() || {};
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState(() =>
    new Date().toISOString().slice(0, 7)
  );
  const [statusFilter, setStatusFilter] = useState<"all" | "settled" | "unsettled">("all");
  const [paidByMap, setPaidByMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user?.pairId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 支払データ取得
        const expenseQuery = query(
          collection(db, "expenses"),
          where("pairId", "==", user.pairId),
          orderBy("date", "desc")
        );
        const expenseSnap = await getDocs(expenseQuery);
        const list = expenseSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Expense[];

        // 月で絞り込み
        const filteredByMonth = list.filter((exp) =>
          exp.date.startsWith(monthFilter)
        );

        // ステータスで絞り込み
        const filtered = filteredByMonth.filter((exp) => {
          if (statusFilter === "settled") return exp.settled;
          if (statusFilter === "unsettled") return !exp.settled;
          return true;
        });

        setExpenses(filtered);

        // 支払者UID → 名前マップ作成
        const usersQuery = query(
          collection(db, "users"),
          where("pairId", "==", user.pairId)
        );
        const usersSnap = await getDocs(usersQuery);
        const map: Record<string, string> = {};
        usersSnap.docs.forEach((doc) => {
          map[doc.id] = doc.data().name;
        });
        setPaidByMap(map);
      } catch (err) {
        console.error("費用の取得に失敗しました", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, monthFilter, statusFilter]);

  const handleStatusChange = async (id: string, newStatus: boolean) => {
    try {
      await updateDoc(doc(db, "expenses", id), {
        settled: newStatus,
      });
      setExpenses((prev) =>
        prev.map((exp) =>
          exp.id === id ? { ...exp, settled: newStatus } : exp
        )
      );
    } catch (err) {
      console.error("ステータス更新失敗", err);
      alert("更新に失敗しました");
    }
  };

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500 text-sm">ログイン情報を確認しています...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 bg-[#FAFAF8]">
      <h1 className="text-xl font-bold text-[#FF6B35] mb-6">費用一覧</h1>

      {/* フィルター */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div>
          <label className="text-sm text-gray-700 block mb-1">月で絞り込み</label>
          <input
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="border rounded-md px-3 py-1"
          />
        </div>
        <div>
          <label className="text-sm text-gray-700 block mb-1">精算ステータス</label>
          <select
            className="border rounded-md px-3 py-1 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">すべて</option>
            <option value="unsettled">未精算のみ</option>
            <option value="settled">精算済みのみ</option>
          </select>
        </div>
      </div>

      {/* 費用リスト */}
      {loading ? (
        <p className="text-sm text-gray-500">読み込み中...</p>
      ) : expenses.length === 0 ? (
        <p className="text-sm text-gray-500">この条件に合う費用がありません</p>
      ) : (
        <ul className="space-y-3">
          {expenses.map((exp) => (
            <li
              key={exp.id}
              className="bg-white p-4 rounded-xl shadow-sm border relative"
            >
              {/* カテゴリーラベル */}
              <div className="inline-block px-2 py-1 rounded-md text-xs font-semibold text-[#FF6B35] bg-orange-50 mb-2">
                {exp.category}
              </div>

              {/* 金額（目立たせる） */}
              <div className="text-2xl font-bold text-[#FF6B35]">
                ¥{exp.amount.toLocaleString()}
              </div>

              {/* 補足情報 */}
              <div className="text-xs text-gray-500 mt-1">
                {exp.date} / 支払者: {paidByMap[exp.paidBy] || "不明"}
              </div>

              {/* 現在のステータス */}
              <div className="mt-2 text-sm">
                <span className="mr-2">精算ステータス:</span>
                <select
                  value={exp.settled ? "settled" : "unsettled"}
                  onChange={(e) =>
                    handleStatusChange(exp.id, e.target.value === "settled")
                  }
                  className="border px-2 py-1 rounded text-sm"
                >
                  <option value="unsettled">未精算</option>
                  <option value="settled">精算済み</option>
                </select>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}