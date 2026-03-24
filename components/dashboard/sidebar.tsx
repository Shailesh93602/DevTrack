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
      <div className="flex h-14 items-center gap-2 border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
          D
        </div>
        <span className="text-sm font-semibold tracking-tight text-foreground">DevTrack</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onItemClick}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200 group",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground font-medium hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground/70 group-hover:text-accent-foreground")} />
                  {label}
                </Link>
              </li>
            );
          })}
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
