This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file from the `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Design Guidelines

### Dark Mode Strategy
DevTrack uses a **strictly semantic CSS variable system** for theme management. 
- **Rule**: Do NOT use `dark:` Tailwind prefixes.
- **Implementation**: All colors are defined as variables in `globals.css` that transition based on the `.dark` class on the `<html>` element.
- **Anti-FOUC**: A blocking inline script in `app/layout.tsx` detects the user's theme preference and applies the correct class before the first paint, preventing "Flash of Unstyled Content".

### SVG & Charts
To ensure compatibility across all browsers (including those with strict SVG attribute rendering), charts and indicators must use the HEX-based CSS variables:
- Grid: `var(--chart-grid)`
- Muted: `var(--chart-muted)`
- Primary: `var(--primary)`

### Accessibility (a11y)
- All interactive elements must have unique `id` for testing and `aria-label` for screen readers.
- Use semantic HTML tags (`main`, `nav`, `section`, `ul/li`) to provide meaningful document structure.
- Maintain a minimum touch target of **44x44px** for mobile-exclusive controls.

## Deploy on Vercel
<truncated-original-content>

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
