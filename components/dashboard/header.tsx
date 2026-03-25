"use client";

import { useState } from "react";
import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Menu, LogOut } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarContent } from "./sidebar";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

interface HeaderProps {
  email?: string;
}

export function Header({ email }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const initials = email ? email.substring(0, 2).toUpperCase() : "U";

  return (
    <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 flex h-14 items-center justify-between border-b px-6 backdrop-blur">
      <div className="flex items-center gap-2 lg:hidden">
        <Button
          variant="ghost"
          size="icon-lg"
          onClick={() => setIsOpen(true)}
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="border-border data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-left-0 data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-left-0 top-0 left-0 h-full w-[280px] -translate-x-0 translate-x-0 -translate-y-0 translate-y-0 rounded-none border-r p-0 sm:max-w-[280px]"
          showCloseButton={true}
        >
          <DialogTitle className="sr-only">Navigation Menu</DialogTitle>
          <SidebarContent onItemClick={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>

      <div className="flex flex-1 items-center justify-end gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="border-border relative h-8 w-8 rounded-full border"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm leading-none font-medium">Account</p>
                <p className="text-muted-foreground text-xs leading-none">
                  {email || "User"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={logout} className="w-full">
                <Button
                  type="submit"
                  variant="ghost"
                  className="hover:bg-muted h-9 w-full justify-start rounded-md px-2 text-sm font-normal transition-colors"
                >
                  <LogOut className="text-muted-foreground mr-2 h-4 w-4" />
                  <span>Log out</span>
                </Button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
