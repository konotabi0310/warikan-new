"use client"

import { usePathname, useRouter } from "next/navigation"
import { Home, PlusCircle, List, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/home", icon: Home, label: "ホーム" },
  { href: "/expense/new", icon: PlusCircle, label: "追加" },
  { href: "/expense/list", icon: List, label: "一覧" },
  { href: "/settings", icon: Settings, label: "設定" },
]

export default function NavigationBar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-[#FF6B35] text-white shadow-inner">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "flex flex-col items-center justify-center text-xs transition-all duration-200",
                isActive ? "text-[#FF6B35] bg-white px-4 py-2 rounded-xl" : "text-white"
              )}
            >
              <item.icon size={22} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}