create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;
alter function public.has_staff_role(text[]) set schema private;
alter function private.has_staff_role(text[]) set search_path = pg_catalog, public;
revoke all on function private.has_staff_role(text[]) from public, anon;
grant execute on function private.has_staff_role(text[]) to authenticated;
