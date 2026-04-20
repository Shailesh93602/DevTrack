import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service — DevTrack",
  description: "The rules that apply to using DevTrack.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to home
      </Link>
      <h1 className="text-foreground mb-2 text-3xl font-semibold tracking-tight">
        Terms of Service
      </h1>
      <p className="text-muted-foreground text-sm">
        Last updated: 2026-04-20
      </p>

      <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none">
        <h2>1. What DevTrack is</h2>
        <p>
          DevTrack is a personal developer-progress tracking dashboard. You
          own your data. We don&apos;t sell it, share it, or look at it
          unless you explicitly ask us to.
        </p>

        <h2>2. Using the service</h2>
        <p>
          You need one email address, one password, and to be at least 13
          years old. Don&apos;t upload anything that isn&apos;t yours, and
          don&apos;t try to break the service for other users.
        </p>

        <h2>3. Your content</h2>
        <p>
          Daily logs, DSA problems, projects, and notes are yours. You can
          export them or delete your account at any time, and we will
          purge the data from the primary database within 30 days.
        </p>

        <h2>4. Availability</h2>
        <p>
          We try to keep DevTrack online but we do not guarantee uptime.
          This is a hobbyist-level service running on Supabase + Vercel
          free tiers.
        </p>

        <h2>5. Changes</h2>
        <p>
          If these terms change, the date at the top changes. Material
          changes will be announced via email.
        </p>

        <h2>6. Contact</h2>
        <p>
          Questions:{" "}
          <a
            href="mailto:shailesh93602@gmail.com"
            className="underline-offset-4 hover:underline"
          >
            shailesh93602@gmail.com
          </a>
          .
        </p>
      </div>
    </main>
  );
}
