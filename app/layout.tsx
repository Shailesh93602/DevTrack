import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans", // consumed by --font-sans in @theme
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://daily-dev-track.vercel.app";
const SITE_DESCRIPTION =
  "Log what you shipped, the DSA problems you solved, and the projects you moved forward — and watch the pattern emerge across weeks. Real-time sync across tabs.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "DevTrack — developer progress dashboard",
    template: "%s — DevTrack",
  },
  description: SITE_DESCRIPTION,
  applicationName: "DevTrack",
  keywords: [
    "developer productivity",
    "daily log",
    "DSA tracker",
    "leetcode tracker",
    "coding streak",
    "learning log",
  ],
  openGraph: {
    title: "DevTrack — developer progress dashboard",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "DevTrack",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevTrack — developer progress dashboard",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Inline theme script — runs synchronously before paint to prevent
            flash of wrong theme. Sets both the .dark class AND the
            color-scheme CSS property so browser UI (scrollbars, form
            controls, native date pickers) starts in the right palette.
            Without color-scheme, a 50-150ms flash of light-themed
            scrollbars was still visible even with the class set. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('devtrack-theme');var d=t==='dark'||((t==='system'||!t)&&matchMedia('(prefers-color-scheme: dark)').matches);var el=document.documentElement;if(d){el.classList.add('dark');el.style.colorScheme='dark';}else{el.style.colorScheme='light';}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
