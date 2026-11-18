-- =====================================================================
-- FEBNIKS KITCHEN: Customer Support + Inventory
-- Run once in Supabase Dashboard -> SQL Editor.
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE / DROP POLICY IF EXISTS.
-- Relies on the existing function public.is_admin().
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Shared helper: keep updated_at fresh
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================================
-- CUSTOMER SUPPORT
-- =====================================================================

create sequence if not exists public.support_ticket_seq start 1001;

create table if not exists public.support_tickets (
  id              uuid primary key default gen_random_uuid(),
  ticket_number   text not null unique
                  default ('TKT-' || nextval('public.support_ticket_seq')::text),
  user_id         uuid not null references auth.users(id) on delete cascade,
  order_id        uuid references public.orders(id) on delete set null,
  customer_name   text not null,
  customer_email  text,
  subject         text not null check (char_length(subject) between 3 and 150),
  category        text not null default 'other'
                  check (category in ('payment', 'order_delay', 'refund', 'wrong_item', 'app_bug', 'other')),
  priority        text not null default 'medium'
                  check (priority in ('low', 'medium', 'high')),
  status          text not null default 'open'
                  check (status in ('open', 'in_progress', 'resolved', 'closed')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists support_tickets_user_idx    on public.support_tickets (user_id);
create index if not exists support_tickets_status_idx  on public.support_tickets (status);
create index if not exists support_tickets_updated_idx on public.support_tickets (updated_at desc);

drop trigger if exists support_tickets_updated_at on public.support_tickets;
create trigger support_tickets_updated_at
  before update on public.support_tickets
  for each row execute function public.set_updated_at();

create table if not exists public.support_messages (
  id           uuid primary key default gen_random_uuid(),
  ticket_id    uuid not null references public.support_tickets(id) on delete cascade,
  sender_id    uuid not null references auth.users(id) on delete cascade,
  sender_role  text not null check (sender_role in ('customer', 'admin')),
  body         text not null check (char_length(body) between 1 and 2000),
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists support_messages_ticket_idx
  on public.support_messages (ticket_id, created_at);

-- A new message bumps the ticket so it rises to the top of the admin list.
create or replace function public.touch_ticket_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.support_tickets
     set updated_at = now()
   where id = new.ticket_id;
  return new;
end;
$$;

drop trigger if exists support_messages_touch_ticket on public.support_messages;
create trigger support_messages_touch_ticket
  after insert on public.support_messages
  for each row execute function public.touch_ticket_on_message();

-- ---------- RLS: support ----------
alter table public.support_tickets  enable row level security;
alter table public.support_messages enable row level security;

-- Admins: full access
drop policy if exists "support_tickets admin all" on public.support_tickets;
create policy "support_tickets admin all" on public.support_tickets
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "support_messages admin all" on public.support_messages;
create policy "support_messages admin all" on public.support_messages
  for all using (public.is_admin()) with check (public.is_admin());

-- Customers: read their own tickets
drop policy if exists "support_tickets customer select own" on public.support_tickets;
create policy "support_tickets customer select own" on public.support_tickets
  for select using (user_id = auth.uid());

-- Customers: open a ticket for themselves only, always starting as 'open'.
-- (No UPDATE/DELETE policy for customers, so they cannot change status or priority.)
drop policy if exists "support_tickets customer insert own" on public.support_tickets;
create policy "support_tickets customer insert own" on public.support_tickets
  for insert with check (
    user_id = auth.uid()
    and status = 'open'
    and priority = 'medium'
  );

-- Customers: read messages on their own tickets
drop policy if exists "support_messages customer select own" on public.support_messages;
create policy "support_messages customer select own" on public.support_messages
  for select using (
    exists (
      select 1 from public.support_tickets t
       where t.id = support_messages.ticket_id
         and t.user_id = auth.uid()
    )
  );

-- Customers: reply on their own, not-closed tickets, as 'customer' only
drop policy if exists "support_messages customer insert own" on public.support_messages;
create policy "support_messages customer insert own" on public.support_messages
  for insert with check (
    sender_id = auth.uid()
    and sender_role = 'customer'
    and exists (
      select 1 from public.support_tickets t
       where t.id = support_messages.ticket_id
         and t.user_id = auth.uid()
         and t.status <> 'closed'
    )
  );

-- =====================================================================
-- INVENTORY (admin only)
-- =====================================================================

create table if not exists public.inventory_items (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null unique check (char_length(name) between 1 and 100),
  unit                text not null default 'kg',
  quantity            numeric(12,2) not null default 0 check (quantity >= 0),
  low_stock_threshold numeric(12,2) not null default 15 check (low_stock_threshold >= 0),
  critical_threshold  numeric(12,2) not null default 5  check (critical_threshold >= 0),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

drop trigger if exists inventory_items_updated_at on public.inventory_items;
create trigger inventory_items_updated_at
  before update on public.inventory_items
  for each row execute function public.set_updated_at();

create table if not exists public.inventory_logs (
  id          uuid primary key default gen_random_uuid(),
  item_id     uuid not null references public.inventory_items(id) on delete cascade,
  change      numeric(12,2) not null check (change <> 0),   -- +20 = restock, -3 = used
  reason      text not null default 'Restock',
  order_id    uuid references public.orders(id) on delete set null,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists inventory_logs_item_idx    on public.inventory_logs (item_id, created_at desc);
create index if not exists inventory_logs_created_idx on public.inventory_logs (created_at desc);

-- Atomic stock change: writes the log and updates quantity in one step,
-- and refuses to go below zero. Admin only.
create or replace function public.adjust_inventory(
  p_item_id  uuid,
  p_change   numeric,
  p_reason   text default 'Restock',
  p_order_id uuid default null
)
returns public.inventory_items
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item public.inventory_items;
begin
  if not public.is_admin() then
    raise exception 'Access denied: admin only';
  end if;

  if p_change = 0 then
    raise exception 'Change cannot be zero';
  end if;

  update public.inventory_items
     set quantity = quantity + p_change
   where id = p_item_id
     and quantity + p_change >= 0
  returning * into v_item;

  if not found then
    raise exception 'Item not found or stock would go below zero';
  end if;

  insert into public.inventory_logs (item_id, change, reason, order_id, created_by)
  values (p_item_id, p_change, coalesce(nullif(trim(p_reason), ''), 'Adjustment'), p_order_id, auth.uid());

  return v_item;
end;
$$;

revoke all on function public.adjust_inventory(uuid, numeric, text, uuid) from public, anon;
grant execute on function public.adjust_inventory(uuid, numeric, text, uuid) to authenticated;

-- ---------- RLS: inventory ----------
alter table public.inventory_items enable row level security;
alter table public.inventory_logs  enable row level security;

drop policy if exists "inventory_items admin all" on public.inventory_items;
create policy "inventory_items admin all" on public.inventory_items
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "inventory_logs admin all" on public.inventory_logs;
create policy "inventory_logs admin all" on public.inventory_logs
  for all using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- REALTIME (live updates in the admin and user apps)
-- =====================================================================
do $$
declare
  t text;
begin
  foreach t in array array['support_tickets', 'support_messages', 'inventory_items', 'inventory_logs']
  loop
    if not exists (
      select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end;
$$;
