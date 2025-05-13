"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [pairCode, setPairCode] = useState("");
  const router = useRouter();

  const handleRegister = () => {
    // バリデーションや登録処理（後で実装）
    if (!name || !pairCode) return alert("名前とペアコードを入力してください");
    router.push("/home"); // 仮遷移
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-white">
      {/* ロゴとタイトル */}
      <div className="flex flex-col items-center mb-8">
        <Image
          src="/logo.png"
          alt="ラクワリ ロゴ"
          width={80}
          height={80}
          className="mb-3"
        />
        <h1 className="text-2xl font-bold text-[#FF6B35]">ラクワリ</h1>
      </div>

      {/* 入力フォーム */}
      <div className="w-full max-w-sm space-y-4 bg-[#FFF4F0] p-6 rounded-xl shadow-sm">
        <div>
          <label className="text-sm text-gray-700">あなたの名前</label>
          <Input
            className="mt-1 rounded-xl"
            placeholder="例：もえか"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-gray-700">ペアコードを作成または入力</label>
          <Input
            className="mt-1 rounded-xl"
            placeholder="例：love123"
            value={pairCode}
            onChange={(e) => setPairCode(e.target.value)}
          />
        </div>
        <Button
          onClick={handleRegister}
          className="w-full mt-4 rounded-xl bg-[#FF6B35] hover:bg-[#e85d2d]"
        >
          登録してはじめる
        </Button>
      </div>
    </main>
  );
}