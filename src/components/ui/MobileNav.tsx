// src/components/MobileNav.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, List, PlusCircle, CreditCard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "ホーム", icon: Home, href: "/home" },
  { label: "一覧", icon: List, href: "/expense/list" },
  { label: "追加", icon: PlusCircle, href: "/expense/new" },
  { label: "精算", icon: CreditCard, href: "/settlement" },
  { label: "設定", icon: Settings, href: "/settings" },
];

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 w-full h-16 bg-[#FF6B35] flex justify-around items-center z-50 shadow-md">
      {navItems.map(({ label, icon: Icon, href }) => {
        const isActive = pathname.startsWith(href);

        return (
          <button
            key={href}
            onClick={() => router.push(href)}
            className={cn(
              "flex flex-col items-center text-xs transition-all",
              isActive && "scale-110"
            )}
          >
            <Icon
              className={cn(
                "w-5 h-5 mb-1",
                isActive ? "text-white" : "text-white/60"
              )}
            />
            <span className={cn(isActive ? "text-white" : "text-white/60")}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}