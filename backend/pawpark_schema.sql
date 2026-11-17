-- PawPark 2027 - separate Supabase project ONLY (never apply to Concierge).
begin;
create schema if not exists pawpark_private;
revoke all on schema pawpark_private from public, anon;
grant usage on schema pawpark_private to authenticated;

create or replace function pawpark_private.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
select exists (
  select 1 from auth.users u
  where u.id = (select auth.uid())
    and lower(u.email) = 'info@pawapp.net'
    and u.email_confirmed_at is not null
    and u.deleted_at is null
);
$$;
revoke all on function pawpark_private.is_admin() from public, anon;
grant execute on function pawpark_private.is_admin() to authenticated;

create table if not exists public.pawpark_requests (
 id uuid primary key default gen_random_uuid(),
 reference text not null unique default ('PP27-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))),
 request_type text not null check (request_type in ('space','pet_show')),
 business_name text,
 contact_name text not null check (char_length(contact_name) between 1 and 120),
 phone text not null check (char_length(phone) between 7 and 25),
 email text check (email is null or char_length(email) <= 254),
 zone text,
 space_size text,
 show_name text,
 pet_name text,
 pet_type text,
 details jsonb not null default '{}'::jsonb,
 email_notification text not null default 'pending' check (email_notification in ('pending','accepted_by_provider','failed')),
 created_at timestamptz not null default now(),
 check (
  (request_type = 'space' and business_name is not null and email is not null
    and zone in ('Kids Zone','Pets Zone','Food & Beverages','Trucks')
    and space_size in ('3 × 3 m','3 × 4 m','Custom'))
  or
  (request_type = 'pet_show' and show_name is not null and pet_name is not null
    and pet_type in ('Dog','Cat'))
 )
);
create index if not exists pawpark_requests_recent on public.pawpark_requests(created_at desc);

create table if not exists public.pawpark_reviews (
 request_id uuid primary key references public.pawpark_requests(id) on delete cascade,
 status text not null default 'Pending Review'
   check (status in ('Pending Review','Under Review','Approved','Rejected','Waitlisted')),
 notes text not null default '',
 contract_stage text not null default 'Not started'
   check (contract_stage in ('Not started','Preparing','Sent','Signed')),
 contacted_at timestamptz,
 assigned_location text,
 approved_price_kwd numeric(10,3) check (approved_price_kwd >= 0),
 updated_at timestamptz not null default now()
);

create or replace function pawpark_private.insert_review()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
 insert into public.pawpark_reviews(request_id) values (new.id);
 return new;
end;
$$;
revoke all on function pawpark_private.insert_review() from public, anon, authenticated;
drop trigger if exists pawpark_on_request_insert on public.pawpark_requests;
create trigger pawpark_on_request_insert after insert on public.pawpark_requests
for each row execute function pawpark_private.insert_review();

alter table public.pawpark_requests enable row level security;
alter table public.pawpark_reviews enable row level security;
revoke all on public.pawpark_requests from public, anon, authenticated;
revoke all on public.pawpark_reviews from public, anon, authenticated;
grant select on public.pawpark_requests to authenticated;
grant select, update on public.pawpark_reviews to authenticated;

drop policy if exists pp_admin_read_requests on public.pawpark_requests;
create policy pp_admin_read_requests on public.pawpark_requests for select
to authenticated using ((select pawpark_private.is_admin()));
drop policy if exists pp_admin_read_reviews on public.pawpark_reviews;
create policy pp_admin_read_reviews on public.pawpark_reviews for select
to authenticated using ((select pawpark_private.is_admin()));
drop policy if exists pp_admin_update_reviews on public.pawpark_reviews;
create policy pp_admin_update_reviews on public.pawpark_reviews for update
to authenticated using ((select pawpark_private.is_admin()))
with check ((select pawpark_private.is_admin()));
commit;
