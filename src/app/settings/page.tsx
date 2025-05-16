// src/app/settings/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import Image from "next/image";
import { Dialog } from "@headlessui/react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  // 1) フックは必ずコンポーネントの先頭で呼び出す
  const router = useRouter();
  const { user, setUser } = useUser();    // useUser は常に最初
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editedName, setEditedName] = useState(user ? user.name : "");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2) user がまだロードされていない or null の場合のガード表示
  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">ユーザー情報を読み込んでいます…</p>
      </main>
    );
  }

  // 3) 画像選択ハンドラ
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 4) 更新ボタンハンドラ
  const handleUpdate = async () => {
    const updates: { name?: string; avatarUrl?: string } = {};
    if (editedName !== user.name) updates.name = editedName;
    if (selectedImage) updates.avatarUrl = selectedImage;
    if (Object.keys(updates).length === 0) {
      alert("変更がありません");
      return;
    }

    try {
      await updateDoc(doc(db, "users", user.uid), updates);
      setUser({ ...user, ...updates });
      alert("プロフィールを更新しました！");
    } catch (err) {
      console.error("プロフィール更新エラー", err);
      alert("更新に失敗しました。もう一度お試しください。");
    }
  };

  // 5) ログアウトハンドラ
  const handleLogout = async () => {
    const { signOut } = await import("firebase/auth");
    const { auth } = await import("@/lib/firebase");
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="p-6 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold mb-6 text-[#FF6B35]">設定</h1>

      {/* プロフィール画像 */}
      <div className="flex flex-col items-center gap-3 mb-6">
        <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-[#FF6B35]">
          {selectedImage || user.avatarUrl ? (
            <Image
              src={selectedImage || user.avatarUrl!}
              alt="avatar"
              width={112}
              height={112}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
              No Image
            </div>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="text-sm"
        />
      </div>

      {/* 名前入力欄 */}
      <div className="mb-6">
        <input
          type="text"
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          placeholder="名前を入力"
          className="w-full px-4 py-2 border rounded-xl text-center"
        />
      </div>

      {/* 更新ボタン */}
      <Button
        onClick={handleUpdate}
        className="w-full py-2 bg-[#FF6B35] text-white rounded-xl mb-6"
      >
        プロフィールを更新
      </Button>

      {/* ログアウトリンク */}
      <div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-[#FF6B35] underline"
        >
          ログアウト
        </button>
      </div>

      {/* ログアウトモーダル */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
            <Dialog.Title className="text-lg font-semibold mb-4">
              ログアウトしますか？
            </Dialog.Title>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded-xl"
              >
                キャンセル
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-[#FF6B35] text-white rounded-xl"
              >
                ログアウト
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}