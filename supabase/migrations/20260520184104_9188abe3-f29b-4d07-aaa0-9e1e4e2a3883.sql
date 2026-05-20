
-- Korjaa search_path-puutteet
alter function public.omistaa_kiinteiston(uuid) set search_path = public;
alter function public.handle_new_user() set search_path = public;
alter function public.set_updated_at() set search_path = public;

-- Revoke EXECUTE julkisuudesta: näitä ei tarvitse kutsua suoraan APIsta
revoke execute on function public.omistaa_kiinteiston(uuid) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
