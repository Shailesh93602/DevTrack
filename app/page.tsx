import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/auth/supabase-server";

export const metadata = {
  title: "DevTrack — developer progress dashboard",
  description:
    "Track your daily coding activity, DSA problems, and side-project progress in one place. Supabase-Realtime synced across tabs.",
};

/**
 * Public landing for anonymous users. If someone is already logged in,
 * bounce them straight to /dashboard — no reason to make a return visitor
 * look at marketing they've already seen.
 */
export default async function RootPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-base font-semibold tracking-tight"
          >
            DevTrack
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/login"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-9 items-center rounded-md bg-primary px-3.5 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="max-w-2xl">
          <p className="mb-4 inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
            Daily logs · DSA tracking · Realtime sync
          </p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Stop guessing what you&apos;ve learned this month.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            DevTrack is a developer progress dashboard. Log what you
            worked on, the problems you solved, the projects you
            shipped — and see the pattern instead of a pile of
            commits. Synced across every tab in real time.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex h-10 items-center rounded-md bg-primary px-5 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Create a free account
            </Link>
            <Link
              href="/login"
              className="inline-flex h-10 items-center rounded-md border border-border/60 px-5 font-medium transition-colors hover:bg-muted/60"
            >
              Sign in
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Free for personal use · No credit card · Private by default
          </p>
        </div>
      </section>

      {/* Feature triad */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Daily logs"
            body="30 seconds a day. Pick a tag, write a sentence, attach a link. Search the index later when you forget which repo you fixed that bug in."
          />
          <FeatureCard
            title="DSA tracking"
            body="Log the problems you solved with difficulty + pattern tags. Dashboard shows what you're avoiding — the categories you haven't touched in 30 days."
          />
          <FeatureCard
            title="Realtime across tabs"
            body="Supabase Realtime means your log on your phone shows up instantly on your laptop. No refresh. No stale counts on the streak widget."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            How it works
          </h2>
          <ol className="mt-6 grid gap-6 md:grid-cols-3">
            <Step
              num="01"
              title="Sign up"
              body="One email, one password. Your data is scoped to your user row and gated by Supabase RLS."
            />
            <Step
              num="02"
              title="Log every day"
              body="A 30-second form. Tag it, optionally add a repo link or a problem reference, and hit save."
            />
            <Step
              num="03"
              title="See the shape"
              body="Weekly streaks, problem-pattern distribution, project activity heatmap. Filter by tag or project."
            />
          </ol>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} DevTrack. Built by Shailesh Chaudhari.</p>
          <div className="flex gap-6">
            <Link
              href="/login"
              className="transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="transition-colors hover:text-foreground"
            >
              Get started
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-6">
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>
    </div>
  );
}

function Step({
  num,
  title,
  body,
}: {
  num: string;
  title: string;
  body: string;
}) {
  return (
    <li className="rounded-lg border border-border/60 bg-card p-6">
      <span className="text-xs font-semibold tracking-widest text-primary">
        {num}
      </span>
      <h3 className="mt-3 text-base font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>
    </li>
  );
}
