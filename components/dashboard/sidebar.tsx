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

export const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "DSA Problems", href: "/dashboard/problems", icon: Code2 },
  { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { label: "Daily Logs", href: "/dashboard/logs", icon: BookOpen },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function SidebarContent({ className, onItemClick }: { className?: string, onItemClick?: () => void }) {
  const pathname = usePathname();

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex h-14 items-center border-b border-border px-4">
        <span className="text-sm font-semibold text-foreground">DevTrack</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-0.5">
          {navItems.map(({ label, href, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={onItemClick}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                  pathname === href
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden h-full w-56 shrink-0 border-r border-border bg-background lg:block">
      <SidebarContent />
    </aside>
  );
}
