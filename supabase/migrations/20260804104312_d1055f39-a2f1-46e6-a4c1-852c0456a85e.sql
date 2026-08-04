REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.omistaa_kiinteiston(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.inkrementoi_metriikka(uuid, text, integer) FROM anon, public, authenticated;
REVOKE EXECUTE ON FUNCTION public.paivita_ammattilainen_pisteet(uuid) FROM anon, public, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, public, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, public, authenticated;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.omistaa_kiinteiston(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.inkrementoi_metriikka(uuid, text, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.paivita_ammattilainen_pisteet(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.set_updated_at() TO service_role;