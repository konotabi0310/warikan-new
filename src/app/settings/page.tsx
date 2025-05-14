"use client";

import { useUser } from "@/contexts/UserContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import Image from "next/image";
import { Dialog } from "@headlessui/react";

export default function SettingsPage() {
  const { user, setUser } = useUser()!;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    if (!user || !selectedImage) return;

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { avatarUrl: selectedImage });

    setUser({ ...user, avatarUrl: selectedImage });
    alert("プロフィール画像を更新しました！");
  };

  const handleLogout = async () => {
    const { signOut } = await import("firebase/auth");
    const { auth } = await import("@/lib/firebase");
    await signOut(auth);
    window.location.href = "/";
  };

  return (
    <div className="p-6 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold mb-6 text-[#FF6B35]">設定</h1>

      {/* プロフィール画像 */}
      <div className="flex flex-col items-center gap-3 mb-6">
        <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-[#FF6B35]">
          {selectedImage || user?.avatarUrl ? (
            <Image
              src={selectedImage || user?.avatarUrl || ""}
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

        <button
          onClick={handleUpdate}
          className="mt-2 px-6 py-2 bg-[#FF6B35] text-white rounded-xl"
        >
          プロフィール更新
        </button>
      </div>

      {/* ログアウトリンク */}
      <div className="mt-8">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setIsModalOpen(true);
          }}
          className="text-[#FF6B35] underline text-base"
        >
          ログアウト
        </a>
      </div>

      {/* モーダル */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
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