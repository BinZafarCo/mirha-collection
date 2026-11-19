# Mirha Collection By BZ

Next.js 15 storefront foundation for Cloudflare Workers via OpenNext and Supabase.

## Local setup
1. Install Node.js 22.12 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and set Supabase project URL and anon key.
4. Run `supabase/schema.sql` in Supabase SQL Editor.
5. Configure Supabase email OTP template to render the six-digit `{{ .Token }}` code and configure SMTP.
6. Run `npm run dev`.

## Current implementation
- Responsive storefront that reads active products from Supabase.
- Email OTP sign-in and verification through Supabase Auth (requires a configured Supabase project and SMTP).
- Server-side staff-role gate for administration.
- Product workspace: create products, edit name/category/price/stock, change draft/active/archived status.
- Product media URL support for HTTPS image/video links; images retain natural aspect ratios and video links are stored as video media. The current workspace accepts hosted URLs; direct file upload/storage UI is a later step.
- CI runs TypeScript checks and the OpenNext Cloudflare production build on Node.js 22.12.

## Required before accepting live orders
- Configure Supabase project, apply schema, configure email OTP/SMTP, and manually assign the first owner role to the verified auth user UUID.
- Create and configure private Supabase Storage buckets and secure upload policies before enabling direct media uploads.
- Configure Cloudflare Pages/Workers project and production secrets; verify the deployed domain and runtime.
- Implement and test checkout, server-side order creation, customer order history, inventory reservation, staff invitations and granular role permissions.
- Integrate a verified WhatsApp Business OTP provider (not a hardcoded code), PostEx credentials and label/tracking workflow, and payment-provider reconciliation for JazzCash/EasyPaisa.
- Add automated end-to-end tests, rate limiting, audit logs, backups and security review.

Never commit service-role keys, provider tokens, or credentials. Do not accept live orders or payments until the required workflows are implemented and tested.

## Cloudflare deployment (Workers)
- Build command: `npx opennextjs-cloudflare build`
- Deploy command: `npx wrangler deploy`
- Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optional: `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_SITE_URL`)
- `package.json` `build` must stay `next build` (OpenNext calls it internally; pointing it at OpenNext creates an infinite loop).
- Visitor tracking uses the D1 binding `DB` (see `wrangler.jsonc`); tables: `visitors`, `visitor_events`.
