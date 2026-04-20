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

export const metadata: Metadata = {
  title: "DevTrack",
  description: "Developer progress tracking dashboard",
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
