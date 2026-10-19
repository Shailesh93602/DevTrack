/**
 * JSON-LD for the public landing page (app/page.tsx).
 *
 * Every field is a public claim a search or answer engine reads as fact, so
 * each one mirrors something the landing page renders: the name, the
 * description, the three feature cards, "Free for personal use", and the
 * "Built by Shailesh Chaudhari" footer link. No ratings, user counts or
 * features the page does not show. lib/seo/seo.test.ts renders the page and
 * checks each featureList entry against the rendered headings.
 */
export const SITE_URL = "https://daily-dev-track.vercel.app";
export const AUTHOR_NAME = "Shailesh Chaudhari";
export const AUTHOR_URL = "https://shaileshchaudhari.vercel.app";

/** The landing page's feature-card titles, in render order. */
export const LANDING_FEATURES = [
  "Daily logs",
  "DSA tracking",
  "Realtime across tabs",
] as const;

export const LANDING_DESCRIPTION =
  "DevTrack is a developer progress dashboard. Log what you worked on, the problems you solved, the projects you shipped — and see the pattern instead of a pile of commits.";

const AUTHOR_ID = `${SITE_URL}/#author`;

export const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "DevTrack",
      description: LANDING_DESCRIPTION,
      inLanguage: "en",
      publisher: { "@id": AUTHOR_ID },
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#app`,
      name: "DevTrack",
      url: SITE_URL,
      description: LANDING_DESCRIPTION,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      // "Realtime across tabs" is rendered on the page but not repeated here:
      // the subscription was pointed at the wrong table until 2026-08-15 and
      // its live publication step is still unconfirmed (CLAUDE.md). Markup
      // may say less than the page; it must never say more.
      featureList: LANDING_FEATURES.filter((f) => f !== "Realtime across tabs"),
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      author: { "@id": AUTHOR_ID },
    },
    {
      "@type": "Person",
      "@id": AUTHOR_ID,
      name: AUTHOR_NAME,
      url: AUTHOR_URL,
    },
  ],
};

/** JSON for a <script> body: `<` escaped so content can never close the tag. */
export function jsonLdScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
