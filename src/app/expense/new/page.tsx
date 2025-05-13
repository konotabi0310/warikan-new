"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/lib/firebase"
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { useUser } from "@/contexts/UserContext"
import { format } from "date-fns"

export default function ExpenseNewPage() {
  const router = useRouter()
  const userContext = useUser()
  const user = userContext?.user

  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [note, setNote] = useState("")
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [paidBy, setPaidBy] = useState("")
  const [memberNames, setMemberNames] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // ✅ ペアIDからメンバー名一覧を取得
  useEffect(() => {
    if (!user?.pairId) return
    const fetchUsers = async () => {
      const q = query(collection(db, "users"), where("pairId", "==", user.pairId))
      const snap = await getDocs(q)
      const names = snap.docs.map((doc) => doc.data().name as string)
      setMemberNames(names)
    }
    fetchUsers()
  }, [user])

  const handleSubmit = async () => {
    if (!amount || !category || !paidBy || !user?.pairId) {
      alert("すべての項目を入力してください")
      return
    }

    try {
      setLoading(true)
      await addDoc(collection(db, "expenses"), {
        amount: parseInt(amount),
        category,
        note,
        date,
        paidBy,
        payId: user.pairId,
        settled: false,
        createdAt: serverTimestamp(),
      })
      router.push("/expense/list")
    } catch (err) {
      console.error("登録失敗", err)
      alert("登録に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white p-6 flex flex-col items-center">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-[#FF6B35] text-center">費用登録</h1>

        {/* 金額 */}
        <div className="space-y-2">
          <Label>金額 (¥)</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="rounded-xl border-gray-300"
          />
        </div>

        {/* 日付 */}
        <div className="space-y-2">
          <Label>日付</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border-gray-300"
          />
        </div>

        {/* カテゴリ */}
        <div className="space-y-2">
          <Label>カテゴリ</Label>
          <Select value={category} onValueChange={setCategory}>
  <SelectTrigger className="rounded-xl border-gray-300">
    <SelectValue placeholder="カテゴリを選択" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="食費">食費</SelectItem>
    <SelectItem value="家賃">家賃</SelectItem>
    <SelectItem value="光熱費">光熱費</SelectItem>
    <SelectItem value="その他">その他</SelectItem>
  </SelectContent>
</Select>
        </div>

        {/* 支払った人 */}
        <div className="space-y-2">
          <Label>支払った人</Label>
          <Select value={paidBy} onValueChange={setPaidBy}>
            <SelectTrigger className="rounded-xl border-gray-300">
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              {memberNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* メモ */}
        <div className="space-y-2">
          <Label>メモ（任意）</Label>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="rounded-xl border-gray-300"
          />
        </div>

        {/* 登録ボタン */}
        <Button
          disabled={loading}
          onClick={handleSubmit}
          className="w-full py-6 text-lg font-medium bg-[#FF6B35] text-white hover:bg-[#e55a2a] rounded-xl"
        >
          {loading ? "登録中..." : "登録する"}
        </Button>
      </div>
    </main>
  )
}