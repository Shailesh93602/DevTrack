"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Code2,
  FolderKanban,
  BookOpen,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "DSA Problems", href: "/dashboard/problems", icon: Code2 },
  { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { label: "Daily Logs", href: "/dashboard/logs", icon: BookOpen },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-gray-100 bg-white">
      <div className="flex h-14 items-center border-b border-gray-100 px-4">
        <span className="text-sm font-semibold text-gray-900">DevTrack</span>
      </div>

      <nav className="p-2">
        <ul className="space-y-0.5">
          {navItems.map(({ label, href, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                  pathname === href
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
