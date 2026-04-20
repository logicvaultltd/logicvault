This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment

Create a local `.env.local` file from `.env.template` or `.env.example` before running the app locally.

Core variables used by the app:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `LEX_ADMIN_EMAIL`
- `LEX_ADMIN_PASSWORD`
- `LEX_ADMIN_SECRET`
- `CONTACT_FROM_EMAIL`
- `CONTACT_TO_EMAIL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`

Optional but recommended:

- `SUPABASE_SERVICE_ROLE_KEY` for visitor logging and admin config writes
- `CONTACT_SECURITY_SECRET` for contact-session signing
- `NEXT_PUBLIC_TRUSTPILOT_URL` for branded review links
- provider keys listed in `.env.template` / `.env.example`

The app also accepts `AI_SUMMARIZATION_KEY` as a legacy alias for `GEMINI_API_KEY`, and `PDF_CO_API_KEY` as a legacy alias for `PDFCO_API_KEY`.

Keep `.env.local`, `.env.production`, and `.vercel/` out of Git. Vercel production should carry the same real values because local env files are never pushed to GitHub.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
