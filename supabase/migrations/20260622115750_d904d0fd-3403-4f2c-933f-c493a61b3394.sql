
REVOKE EXECUTE ON FUNCTION public.paivita_ammattilainen_pisteet(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.paivita_ammattilainen_pisteet(uuid) TO service_role;
