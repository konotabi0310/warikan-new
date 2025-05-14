"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const userContext = useUser();
  const user = userContext?.user;

  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user]);

  const handleUpdate = async () => {
    if (!user?.uid) {
      alert("ユーザー情報が見つかりません");
      return;
    }

    setSaving(true);
    try {
      const ref = doc(db, "users", user.uid); // ← uid を Firestore のIDとして使用
      await updateDoc(ref, {
        name,
        avatarUrl,
      });
      alert("プロフィールを更新しました");
    } catch (err) {
      console.error("更新エラー:", err);
      alert("更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 簡易的なローカルURL表示（アップロード処理未実装）
    const localUrl = URL.createObjectURL(file);
    setAvatarUrl(localUrl);

    // TODO: 実際は Firebase Storage にアップして URL を取得 → setAvatarUrl に入れる
  };

  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <h1 className="text-xl font-bold text-[#FF6B35] mb-6">プロフィール設定</h1>

      <div className="space-y-4 max-w-md">
        {/* 名前 */}
        <div>
          <Label>名前</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 rounded-xl"
          />
        </div>

        {/* アバター */}
        <div>
          <Label>アイコン画像</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1"
          />
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt="アイコンプレビュー"
              className="w-20 h-20 rounded-full mt-2 object-cover border"
            />
          )}
        </div>

        {/* 更新ボタン */}
        <Button
          onClick={handleUpdate}
          disabled={saving}
          className="w-full mt-6 rounded-xl bg-[#FF6B35] hover:bg-[#e85d2d] text-white"
        >
          {saving ? "保存中..." : "更新する"}
        </Button>
      </div>
    </main>
  );
}