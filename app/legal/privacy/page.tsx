import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — DevTrack",
  description: "How DevTrack handles your data.",
};

export default function PrivacyPage() {
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
        Privacy Policy
      </h1>
      <p className="text-muted-foreground text-sm">
        Last updated: 2026-04-20
      </p>

      <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none">
        <h2>What we collect</h2>
        <ul>
          <li>Your email address (for sign-in + confirmation)</li>
          <li>Anything you log — daily entries, DSA problems, projects</li>
          <li>
            Minimal anonymous usage metrics (page views, errors) via Vercel
            Analytics
          </li>
        </ul>

        <h2>Where it lives</h2>
        <ul>
          <li>
            Supabase Postgres (Singapore region). Row-level security scopes
            every table to the owning user.
          </li>
          <li>
            Supabase Auth for session / password storage. We never see your
            raw password.
          </li>
        </ul>

        <h2>What we don&apos;t do</h2>
        <ul>
          <li>Sell or rent your data.</li>
          <li>Read your logs.</li>
          <li>Send marketing email.</li>
        </ul>

        <h2>Export + delete</h2>
        <p>
          You can export your data or delete your account from Settings. A
          deletion request purges the primary database within 30 days.
          Supabase backup retention may keep a copy for up to 60 days after
          that.
        </p>

        <h2>Contact</h2>
        <p>
          Data access, correction, or deletion requests:{" "}
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
