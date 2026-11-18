# Mirha Collection By BZ

Next.js storefront foundation prepared for Cloudflare Workers via OpenNext and Supabase.

## Stack
- Next.js 15 / React 19 / TypeScript
- Supabase Auth (email OTP/magic link) and PostgreSQL with Row Level Security
- Cloudflare Workers through OpenNext
- GitHub as the source of truth

## Local setup
1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and set the Supabase project URL and anon key.
4. Run the SQL in `supabase/schema.sql` in Supabase SQL Editor.
5. Run `npm run dev`.

## Security setup still required
- Configure Supabase email SMTP and OTP templates.
- Create the first owner role manually using the verified auth user UUID.
- Configure private Storage buckets and upload policies for product media.
- Configure a verified WhatsApp Business API provider before enabling WhatsApp OTP.
- Configure Cloudflare environment secrets and GitHub-linked deployment.
- Never put Supabase service-role keys, provider tokens, or credentials in client code or Git.

## Important status
This commit establishes the application framework, storefront foundation, email sign-in request, role-aware admin overview and database/RLS foundation. It is not yet a complete commerce platform. Checkout/order creation, full product CRUD/media manager, staff invitations, payment reconciliation, PostEx integration, WhatsApp OTP and automated browser tests remain implementation milestones. Demo product cards are display examples only; do not accept live payments/orders until those workflows are completed and tested.
