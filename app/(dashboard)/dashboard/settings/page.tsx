import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import { logout } from "@/lib/auth/actions";

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground text-lg font-semibold">Settings</h2>
        <p className="text-muted-foreground text-sm">
          Manage your account and preferences.
        </p>
      </div>

      <Separator />

      <Card className="border-border rounded-lg border shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>Your account information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-foreground text-sm font-medium">Email</p>
            <p className="text-muted-foreground text-sm">{user.email}</p>
          </div>

          <Separator />

          <form action={logout}>
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
