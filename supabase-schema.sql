-- Supabase schema for noah-app
-- Run this script in the Supabase SQL editor (or `supabase db push`) right after creating the project.

-- Tables --------------------------------------------------------------------

create table if not exists public.game_scores (
  id          bigserial primary key,
  created_at  timestamptz not null default now(),
  game_type   text        not null,
  score       integer     not null default 0 check (score >= 0),
  date        date        not null default current_date,
  time        time        not null default '00:00:00'
);

create table if not exists public.noa_stats (
  id           bigserial primary key,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  hunger       smallint not null default 80 check (hunger between 0 and 100),
  happiness    smallint not null default 80 check (happiness between 0 and 100),
  energy       smallint not null default 80 check (energy between 0 and 100),
  coins_earned integer not null default 0,
  coins_spent  integer not null default 0
);

create table if not exists public.noa_shop_items (
  id          text primary key,
  created_at  timestamptz not null default now(),
  name        text not null,
  description text,
  price       integer not null default 0,
  category    text not null check (category in ('food', 'toys', 'theme', 'decoration')),
  image_url   text
);

-- Trigger to keep updated_at fresh on noa_stats updates
create or replace function public.set_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_timestamp on public.noa_stats;
create trigger set_timestamp
before update on public.noa_stats
for each row execute function public.set_timestamp();

-- Row Level Security --------------------------------------------------------

alter table public.game_scores enable row level security;
alter table public.noa_stats enable row level security;
alter table public.noa_shop_items enable row level security;

-- game_scores policies: allow public reads/inserts/deletes (needed by UI)
create policy "game_scores_read" on public.game_scores
  for select using (true);
create policy "game_scores_insert" on public.game_scores
  for insert with check (true);
create policy "game_scores_delete" on public.game_scores
  for delete using (true);

-- noa_stats policies: allow public read/insert, restrict deletes to service role
create policy "noa_stats_read" on public.noa_stats
  for select using (true);
create policy "noa_stats_insert" on public.noa_stats
  for insert with check (true);
create policy "noa_stats_delete_service_only" on public.noa_stats
  for delete using (auth.role() = 'service_role');

-- noa_shop_items policies: public read, service role writes
create policy "shop_items_read" on public.noa_shop_items
  for select using (true);
create policy "shop_items_write_service_only" on public.noa_shop_items
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Helpful indexes -----------------------------------------------------------
create index if not exists game_scores_type_score_idx on public.game_scores (game_type, score desc);
create index if not exists game_scores_created_at_idx on public.game_scores (created_at desc);
create index if not exists noa_stats_updated_at_idx on public.noa_stats (updated_at desc);

-- Seed data (paths verified in /public/images) -----------------------------
insert into public.noa_shop_items (id, name, description, price, category, image_url)
values
  ('food-01', 'Jugo de naranja', 'Recupera algo de energia.', 6, 'food', '/images/shop-items/food/orange-juice.png'),
  ('toys-01', 'Cotito', 'Juguete suave y reconfortante.', 12, 'toys', '/images/shop-items/toys/cotito.png'),
  ('toys-02', 'Dragoncito', 'Sube felicidad rapido.', 15, 'toys', '/images/shop-items/toys/dragoncito.png'),
  ('toys-03', 'Majin Buu', 'Juguete grande, aumenta felicidad.', 18, 'toys', '/images/shop-items/toys/majimbuu.png'),
  ('toys-04', 'Peluche Cute', 'Favorito de Noa.', 10, 'toys', '/images/shop-items/toys/peluche_cute.png'),
  ('theme-01', 'Tema azul con patitas', 'Skin azul con huellas.', 20, 'theme', '/images/shop-items/theme/azul-con-patitas.png'),
  ('theme-02', 'Tema azul simple', 'Skin azul minimal.', 18, 'theme', '/images/shop-items/theme/azul-patitas.png'),
  ('theme-03', 'Tema Game Boy', 'Skin estilo consola.', 22, 'theme', '/images/shop-items/theme/game-boy.png'),
  ('theme-04', 'Tema textura', 'Fondo texturizado.', 16, 'theme', '/images/shop-items/theme/texture4.png'),
  ('dec-01', 'Casa deco', 'Decoracion para el fondo.', 14, 'decoration', '/images/shop-items/decoration/house.png'),
  ('dec-02', 'Plantita', 'Pequena planta decorativa.', 9, 'decoration', '/images/shop-items/decoration/plantita.png')
on conflict (id) do update
set name = excluded.name,
    description = excluded.description,
    price = excluded.price,
    category = excluded.category,
    image_url = excluded.image_url;

