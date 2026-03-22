import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  email?: string;
}

export function Header({ email }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <div />
      <div className="flex items-center gap-4">
        {email && (
          <span className="text-sm text-muted-foreground">{email}</span>
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
