create table public.pts_lykkaykset (
  id uuid primary key default gen_random_uuid(),
  kiinteisto_id uuid not null,
  kohde text not null,
  lykatty_vuoteen integer not null,
  peruste text,
  created_at timestamp with time zone not null default now()
);

create unique index pts_lykkaykset_kiinteisto_kohde_idx
  on public.pts_lykkaykset (kiinteisto_id, kohde);

alter table public.pts_lykkaykset enable row level security;

create policy "PTS lykkaykset select" on public.pts_lykkaykset
  for select using (public.omistaa_kiinteiston(kiinteisto_id));
create policy "PTS lykkaykset insert" on public.pts_lykkaykset
  for insert with check (public.omistaa_kiinteiston(kiinteisto_id));
create policy "PTS lykkaykset update" on public.pts_lykkaykset
  for update using (public.omistaa_kiinteiston(kiinteisto_id));
create policy "PTS lykkaykset delete" on public.pts_lykkaykset
  for delete using (public.omistaa_kiinteiston(kiinteisto_id));