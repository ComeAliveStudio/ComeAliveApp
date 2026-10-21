-- Come Alive Studio: free sign-up support
-- Run once in Supabase > SQL Editor. Safe to run again (IF NOT EXISTS).

alter table public.members
  add column if not exists full_name          text,
  add column if not exists newsletter_consent boolean not null default false,
  add column if not exists welcome_sent_at    timestamptz;

-- The Stripe webhook already writes: email, plan, plan_status, stripe_customer_id, addons.
-- If the "addons" column does not exist yet, uncomment the next line:
-- alter table public.members add column if not exists addons text[];
