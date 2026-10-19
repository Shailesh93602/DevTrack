import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Calendar,
  CircleCheck,
  GitBranch,
  Keyboard,
  LineChart,
  Zap,
} from "lucide-react";
import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import {
  AUTHOR_NAME,
  AUTHOR_URL,
  LANDING_DESCRIPTION,
  LANDING_FEATURES,
  homeJsonLd,
  jsonLdScript,
} from "@/lib/seo/structured-data";

export const metadata = {
  title: "DevTrack — developer progress dashboard",
  description:
    "Track your daily coding activity, DSA problems, and side-project progress in one place. Supabase-Realtime synced across tabs.",
  // A canonical is a claim about ONE url, so it lives on each page, never on
  // the root layout (every page without its own would inherit the home URL).
  alternates: { canonical: "/" },
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
    <main id="main-content" className="bg-background text-foreground min-h-dvh">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(homeJsonLd) }}
      />
      {/* Nav */}
      <header className="border-border/60 border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link
            href="/"
            className="text-base font-semibold tracking-tight select-none"
          >
            DevTrack
          </Link>
          <nav
            className="flex items-center gap-2 text-sm sm:gap-4"
            aria-label="Primary"
          >
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground inline-flex h-9 items-center rounded-md px-2 transition-colors sm:px-3"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center rounded-md px-3 font-medium shadow-sm transition-colors sm:px-3.5"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="max-w-2xl">
          <p className="border-border/60 bg-muted/40 text-muted-foreground mb-4 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium">
            Daily logs · DSA tracking · Realtime sync
          </p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Stop guessing what you&apos;ve learned this month.
          </h1>
          <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
            {LANDING_DESCRIPTION} Synced across every tab in real time.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/signup"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-11 items-center justify-center rounded-md px-5 font-medium shadow-sm transition-colors"
            >
              Create a free account
            </Link>
            <Link
              href="/login"
              className="border-border/60 hover:bg-muted/60 inline-flex h-11 items-center justify-center rounded-md border px-5 font-medium transition-colors"
            >
              Sign in
            </Link>
          </div>
          <p className="text-muted-foreground mt-4 text-xs">
            Free for personal use · No credit card · Private by default
          </p>
        </div>
      </section>

      {/* Feature triad */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={Calendar}
            title={LANDING_FEATURES[0]}
            body="30 seconds a day. Pick a tag, write a sentence, attach a link. Search the index later when you forget which repo you fixed that bug in."
          />
          <FeatureCard
            icon={LineChart}
            title={LANDING_FEATURES[1]}
            body="Log the problems you solved with difficulty + pattern tags. Dashboard shows what you're avoiding — the categories you haven't touched in 30 days."
          />
          <FeatureCard
            icon={Zap}
            title={LANDING_FEATURES[2]}
            body="Your log on your phone shows up instantly on your laptop. No refresh. No stale counts on the streak widget."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="border-border/60 bg-muted/20 border-t">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            How it works
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
            Three steps. No onboarding walls, no templates to pick, no pricing
            page to scroll past — log, review, repeat.
          </p>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            <Step
              icon={CircleCheck}
              num="01"
              title="Sign up"
              body="One email, one password. Your data is scoped to your user row and gated by row-level security."
            />
            <Step
              icon={Keyboard}
              num="02"
              title="Log every day"
              body="A 30-second form. Tag it, optionally add a repo link or a problem reference, and hit save."
            />
            <Step
              icon={GitBranch}
              num="03"
              title="See the shape"
              body="Weekly streaks, problem-pattern distribution, project activity heatmap. Filter by tag or project."
            />
          </ol>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-border/60 border-t pb-[env(safe-area-inset-bottom)]">
        <div className="text-muted-foreground mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm sm:px-6">
          <p>
            © {new Date().getFullYear()} DevTrack. Built by{" "}
            <a
              href={AUTHOR_URL}
              className="hover:text-foreground underline-offset-4 transition-colors hover:underline"
            >
              {AUTHOR_NAME}
            </a>
            .
          </p>
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <Link
              href="/legal/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/legal/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/login"
              className="hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="hover:text-foreground transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

type IconComponent = React.ComponentType<{ className?: string }>;

function FeatureCard({
  icon: Icon,
  title,
  body,
}: {
  icon: IconComponent;
  title: string;
  body: string;
}) {
  return (
    <div className="border-border/60 bg-card hover:border-border rounded-lg border p-6 transition-colors">
      <div className="bg-primary/10 text-primary mb-4 inline-flex size-9 items-center justify-center rounded-md">
        <Icon className="size-4" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
        {body}
      </p>
    </div>
  );
}

function Step({
  icon: Icon,
  num,
  title,
  body,
}: {
  icon: IconComponent;
  num: string;
  title: string;
  body: string;
}) {
  return (
    <li className="border-border/60 bg-card rounded-lg border p-6">
      <div className="flex items-center gap-2">
        <span className="bg-primary/10 text-primary inline-flex size-7 items-center justify-center rounded-md">
          <Icon className="size-3.5" aria-hidden="true" />
        </span>
        <span className="text-primary text-xs font-semibold tracking-widest">
          {num}
        </span>
      </div>
      <h3 className="mt-3 text-base font-semibold tracking-tight">{title}</h3>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
        {body}
      </p>
    </li>
  );
}
