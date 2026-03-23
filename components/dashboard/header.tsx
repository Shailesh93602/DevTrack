"use client";

import { useState } from "react";
import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { SidebarContent } from "./sidebar";

interface HeaderProps {
  email?: string;
}

export function Header({ email }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setIsOpen(true)}
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="left-0 top-0 h-full w-[280px] -translate-x-0 -translate-y-0 translate-x-0 translate-y-0 rounded-none border-r border-border p-0 sm:max-w-[280px] data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-left-0 data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-left-0"
          showCloseButton={true}
        >
          <DialogTitle className="sr-only">Navigation Menu</DialogTitle>
          <SidebarContent onItemClick={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-4">
        {email && (
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {email}
          </span>
        )}
        <form action={logout}>
          <Button variant="ghost" size="sm" type="submit">
            Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}
