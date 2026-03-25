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

export function SidebarContent({
  className,
  onItemClick,
}: {
  className?: string;
  onItemClick?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 flex h-14 items-center gap-2 border-b px-6 backdrop-blur">
        <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold">
          D
        </div>
        <span className="text-foreground text-sm font-semibold tracking-tight">
          DevTrack
        </span>
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
                    "group flex items-center gap-3 rounded-md px-3 py-3 text-sm transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground font-medium"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground/70 group-hover:text-accent-foreground"
                    )}
                  />
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
    <aside className="border-border bg-background hidden h-full w-56 shrink-0 border-r lg:block">
      <SidebarContent />
    </aside>
  );
}
