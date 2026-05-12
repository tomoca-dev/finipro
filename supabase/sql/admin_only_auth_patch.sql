-- =====================================================
-- FINPRO ADMIN-ONLY AUTH PATCH
-- Run after the Modern Core SQL.
-- Also deploy: supabase/functions/admin-create-user/index.ts
-- =====================================================

create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1 from pg_type
    where typname = 'app_role'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.app_role as enum (
      'owner','finance_admin','manager','cashier','viewer','admin','ceo','accountant','auditor','operations'
    );
  end if;
end $$;

-- If app_role already existed, run these lines alone first if Postgres asks for a separate commit.
alter type public.app_role add value if not exists 'admin';
alter type public.app_role add value if not exists 'ceo';
alter type public.app_role add value if not exists 'accountant';
alter type public.app_role add value if not exists 'auditor';
alter type public.app_role add value if not exists 'operations';

alter table public.profiles
add column if not exists username text unique,
add column if not exists is_platform_admin boolean not null default false,
add column if not exists created_by_admin uuid references public.profiles(id) on delete set null,
add column if not exists disabled boolean not null default false;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and coalesce(p.is_platform_admin, false) = true
      and coalesce(p.disabled, false) = false
  );
$$;

create or replace function public.resolve_login_identifier(p_identifier text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_email text;
begin
  select p.email
  into resolved_email
  from public.profiles p
  where lower(p.username) = lower(trim(p_identifier))
    and coalesce(p.disabled, false) = false
  limit 1;

  if resolved_email is null and lower(trim(p_identifier)) = 'admin@2024' then
    resolved_email := 'btesfaye236@gmail.com';
  end if;

  return resolved_email;
end;
$$;

grant execute on function public.resolve_login_identifier(text) to anon, authenticated;

create or replace function public.bootstrap_platform_admin()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_user_id uuid;
begin
  select id
  into admin_user_id
  from auth.users
  where email = 'btesfaye236@gmail.com'
  limit 1;

  if admin_user_id is null then
    raise exception 'Admin user btesfaye236@gmail.com does not exist in Supabase Auth yet.';
  end if;

  insert into public.profiles (id, email, full_name, username, is_platform_admin, disabled)
  values (admin_user_id, 'btesfaye236@gmail.com', 'System Admin', 'admin@2024', true, false)
  on conflict (id) do update
  set email = excluded.email,
      full_name = excluded.full_name,
      username = excluded.username,
      is_platform_admin = true,
      disabled = false;
end;
$$;

create table if not exists public.user_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  email text not null,
  username text,
  full_name text,
  role public.app_role not null default 'viewer',
  invited_by uuid references public.profiles(id) on delete set null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  unique (organization_id, email)
);

alter table public.user_invitations enable row level security;

drop policy if exists user_invitations_admin_all on public.user_invitations;
create policy user_invitations_admin_all
on public.user_invitations
for all
to authenticated
using (
  public.is_platform_admin()
  or public.has_org_role(organization_id, array['owner','admin','finance_admin']::public.app_role[])
)
with check (
  public.is_platform_admin()
  or public.has_org_role(organization_id, array['owner','admin','finance_admin']::public.app_role[])
);

create or replace function public.admin_disable_user(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'Only platform admin can disable users';
  end if;

  update public.profiles set disabled = true where id = p_user_id;
  return true;
end;
$$;

create or replace function public.admin_change_user_role(
  p_organization_id uuid,
  p_user_id uuid,
  p_role public.app_role
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (
    public.is_platform_admin()
    or public.has_org_role(p_organization_id, array['owner','admin','finance_admin']::public.app_role[])
  ) then
    raise exception 'Only admin can change roles';
  end if;

  update public.organization_members
  set role = p_role
  where organization_id = p_organization_id
    and user_id = p_user_id;

  return true;
end;
$$;

-- Optional: create/link FinOpsPro organization after admin auth user exists.
-- 1) Create btesfaye236@gmail.com under Authentication > Users.
-- 2) Run: select public.bootstrap_platform_admin();
-- 3) Run this block if you need the first organization and owner membership:
-- with admin_profile as (
--   select id from public.profiles where email = 'btesfaye236@gmail.com'
-- ), new_org as (
--   insert into public.organizations (name, created_by)
--   select 'FinOpsPro', id from admin_profile
--   on conflict do nothing
--   returning id
-- ), org_row as (
--   select id from new_org
--   union all
--   select id from public.organizations where name = 'FinOpsPro' limit 1
-- )
-- insert into public.organization_members (organization_id, user_id, role)
-- select org_row.id, admin_profile.id, 'owner'::public.app_role
-- from org_row, admin_profile
-- on conflict do nothing;
