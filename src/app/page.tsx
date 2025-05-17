// src/app/page.tsx
"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function StartPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-white">
      <Image
        src="/logo.png"          // public/logo.png をプロジェクト直下に配置
        alt="ラクワリ ロゴ"
        width={80}
        height={80}
        className="mb-4"
      />
      <h1 className="text-2xl font-bold text-[#FF6B35] mb-2">
        ようこそラクワリへ
      </h1>
      <p className="text-sm text-gray-600 mb-8 text-center">
        カップルの支出管理を、もっとかんたんに
      </p>

      <div className="w-full max-w-xs space-y-4">
        <Button
          className="w-full bg-[#FF6B35] hover:bg-[#e85d2d] text-white rounded-xl"
          onClick={() => router.push("/email-auth")}
        >
          新規登録する
        </Button>
        <Button
          variant="outline"
          className="w-full text-[#FF6B35] border-[#FF6B35] hover:bg-[#FFF4F0] rounded-xl"
          onClick={() => router.push("/login")}
        >
          ログインする
        </Button>
      </div>
    </main>
  );
}