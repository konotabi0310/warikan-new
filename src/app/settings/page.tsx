"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const router = useRouter();
  const userContext = useUser();
  const user = userContext?.user;
  const setUser = userContext?.setUser;

  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // 初期値セット
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAvatarUrl(user.avatarUrl || null);
      setPreviewUrl(user.avatarUrl || null);
    }
  }, [user]);

  if (!user || !setUser) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm text-gray-500">ユーザー情報を読み込んでいます...</p>
      </main>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setAvatarUrl(base64); // Firestore用
      setPreviewUrl(base64); // 表示用
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const ref = doc(db, "users", user.id);
      await updateDoc(ref, {
        name,
        avatarUrl,
        updatedAt: new Date().toISOString(),
      });

      // Context も更新
      setUser({ ...user, name, avatarUrl });
      alert("プロフィールを更新しました！");
    } catch (err) {
      console.error("更新失敗:", err);
      alert("更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAF8] px-6 py-10 flex flex-col items-center">
      <h1 className="text-2xl font-bold text-[#FF6B35] mb-6">設定</h1>

      <div className="w-full max-w-sm space-y-4 bg-white p-6 rounded-xl shadow">
        {/* プロフィール画像 */}
        <div className="flex flex-col items-center">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="アイコン"
              className="w-24 h-24 rounded-full object-cover mb-2 border"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 mb-2" />
          )}
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        {/* 名前 */}
        <div>
          <label className="text-sm text-gray-700 block">名前</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 rounded-xl"
          />
        </div>

        {/* ペアコード（表示のみ） */}
        <div>
          <label className="text-sm text-gray-700 block">ペアコード</label>
          <Input value={user.pairId} disabled className="mt-1 rounded-xl bg-gray-100" />
        </div>

        <Button
          onClick={handleUpdate}
          className="w-full mt-4 bg-[#FF6B35] hover:bg-[#e85d2d] rounded-xl text-white"
          disabled={saving}
        >
          {saving ? "更新中..." : "更新する"}
        </Button>
      </div>
    </main>
  );
}