-- Mirha Collection By BZ: foundational schema. Run in Supabase SQL Editor.
create extension if not exists pgcrypto;
create table if not exists public.staff_roles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null check (role in ('owner','admin','manager','supervisor','frontdesk','inventory')),
 created_at timestamptz not null default now()
);
create or replace function public.has_staff_role(allowed text[])
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.staff_roles where user_id=auth.uid() and role=any(allowed)); $$;
revoke all on function public.has_staff_role(text[]) from public;
grant execute on function public.has_staff_role(text[]) to authenticated;
create table if not exists public.products (
 id uuid primary key default gen_random_uuid(), name text not null, slug text unique not null,
 description text not null default '', category text, price numeric(12,2) not null check(price>=0),
 compare_at_price numeric(12,2), sku text unique, stock integer not null default 0 check(stock>=0),
 status text not null default 'draft' check(status in ('draft','active','archived')),
 cover_url text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.product_media (
 id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
 url text not null, media_type text not null check(media_type in ('image','video')), alt text,
 sort_order integer not null default 0, created_at timestamptz not null default now()
);
create table if not exists public.customers (
 id uuid primary key references auth.users(id) on delete cascade, full_name text, phone text unique,
 address text, city text, created_at timestamptz not null default now()
);
create table if not exists public.orders (
 id uuid primary key default gen_random_uuid(), order_number text unique not null,
 customer_id uuid references public.customers(id), customer_name text not null,
 phone text not null, shipping_address text not null, city text,
 payment_method text not null check(payment_method in ('cod','jazzcash','easypaisa','bank')),
 payment_reference text, payment_status text not null default 'pending',
 order_status text not null default 'pending' check(order_status in ('pending','confirmed','processing','shipped','delivered','cancelled','returned')),
 subtotal numeric(12,2) not null check(subtotal>=0), shipping_fee numeric(12,2) not null default 0,
 total numeric(12,2) not null check(total>=0), courier text, tracking_number text,
 created_at timestamptz not null default now()
);
create table if not exists public.order_items (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
 product_id uuid references public.products(id), product_name text not null, sku text,
 quantity integer not null check(quantity>0), unit_price numeric(12,2) not null check(unit_price>=0)
);
create table if not exists public.inventory_movements (
 id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id),
 quantity_delta integer not null, reason text not null, created_by uuid references auth.users(id),
 created_at timestamptz not null default now()
);
create table if not exists public.suppliers (
 id uuid primary key default gen_random_uuid(), name text not null, phone text, notes text,
 created_at timestamptz not null default now()
);
create table if not exists public.installment_accounts (
 id uuid primary key default gen_random_uuid(), customer_name text not null, phone text not null,
 principal numeric(12,2) not null check(principal>=0), balance numeric(12,2) not null check(balance>=0),
 due_date date, notes text, created_at timestamptz not null default now()
);
alter table public.staff_roles enable row level security;
alter table public.products enable row level security;
alter table public.product_media enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.suppliers enable row level security;
alter table public.installment_accounts enable row level security;
create policy "Public can view active products" on public.products for select using(status='active');
create policy "Staff can manage products" on public.products for all to authenticated using(public.has_staff_role(array['owner','admin','manager','supervisor','inventory'])) with check(public.has_staff_role(array['owner','admin','manager','supervisor','inventory']));
create policy "Public can view active product media" on public.product_media for select using(exists(select 1 from public.products p where p.id=product_id and p.status='active'));
create policy "Staff can manage product media" on public.product_media for all to authenticated using(public.has_staff_role(array['owner','admin','manager','supervisor','inventory'])) with check(public.has_staff_role(array['owner','admin','manager','supervisor','inventory']));
create policy "Customers read own profile" on public.customers for select to authenticated using(id=auth.uid() or public.has_staff_role(array['owner','admin','manager','supervisor','frontdesk']));
create policy "Customers update own profile" on public.customers for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy "Staff manage customers" on public.customers for all to authenticated using(public.has_staff_role(array['owner','admin','manager','supervisor','frontdesk'])) with check(public.has_staff_role(array['owner','admin','manager','supervisor','frontdesk']));
create policy "Staff manage orders" on public.orders for all to authenticated using(public.has_staff_role(array['owner','admin','manager','supervisor','frontdesk'])) with check(public.has_staff_role(array['owner','admin','manager','supervisor','frontdesk']));
create policy "Staff manage order items" on public.order_items for all to authenticated using(public.has_staff_role(array['owner','admin','manager','supervisor','frontdesk'])) with check(public.has_staff_role(array['owner','admin','manager','supervisor','frontdesk']));
create policy "Staff manage inventory" on public.inventory_movements for all to authenticated using(public.has_staff_role(array['owner','admin','manager','supervisor','inventory'])) with check(public.has_staff_role(array['owner','admin','manager','supervisor','inventory']));
create policy "Owners admins manage suppliers" on public.suppliers for all to authenticated using(public.has_staff_role(array['owner','admin','manager'])) with check(public.has_staff_role(array['owner','admin','manager']));
create policy "Owners admins manage installments" on public.installment_accounts for all to authenticated using(public.has_staff_role(array['owner','admin','manager','frontdesk'])) with check(public.has_staff_role(array['owner','admin','manager','frontdesk']));
-- Do not insert a default owner or publish service-role credentials. Assign the first owner
-- manually in Supabase SQL Editor after confirming the correct auth.users UUID.
