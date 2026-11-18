# Mirha Collection By BZ

Next.js storefront foundation prepared for Cloudflare Workers via OpenNext and Supabase.

## Local setup
1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and set Supabase project URL and anon key.
4. Run `supabase/schema.sql` in Supabase SQL Editor.
5. Configure Supabase email OTP template to render the six-digit `{{ .Token }}` code and configure SMTP.
6. Run `npm run dev`.

## Security setup still required
- Create the first owner role manually using the verified auth user UUID.
- Configure private Storage buckets and upload policies for product media.
- Configure a verified WhatsApp Business API provider before enabling WhatsApp OTP.
- Configure Cloudflare environment secrets and GitHub-linked deployment.
- Never put Supabase service-role keys, provider tokens, or credentials in client code or Git.

## Delivery status
This is the first application foundation, not a complete commerce platform. Full product/media management, staff invitations, secure checkout/order creation, WhatsApp OTP, PostEx, payment reconciliation, customer account/order tracking, financial reports and automated browser tests remain to be implemented and tested. Do not accept live orders or payments until those workflows are complete.
