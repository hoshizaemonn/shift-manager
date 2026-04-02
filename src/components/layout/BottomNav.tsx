"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Upload, Calendar, BarChart3 } from "lucide-react";

const tabs = [
  { href: "/", label: "読み取り", icon: Upload },
  { href: "/calendar", label: "カレンダー", icon: Calendar },
  { href: "/summary", label: "集計", icon: BarChart3 },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="max-w-lg mx-auto flex">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center py-2 pt-3 ${
                isActive ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
