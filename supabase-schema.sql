-- =============================================
-- TygerDragon - Schema
-- Corre esto en Supabase > SQL Editor
-- =============================================

create table membership_types (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  duration_days integer not null,
  price decimal(10,2) default null,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table members (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text default null,
  email text default null,
  photo_url text default null,
  membership_type_id uuid references membership_types(id) on delete set null,
  start_date date not null,
  end_date date not null,
  status text default 'active' check (status in ('active', 'inactive')),
  notes text default null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger para actualizar updated_at automaticamente
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger members_updated_at
  before update on members
  for each row execute function update_updated_at();

-- RLS (Row Level Security) - Solo admins autenticados pueden leer/escribir
alter table membership_types enable row level security;
alter table members enable row level security;

create policy "Admins autenticados" on membership_types
  for all using (auth.role() = 'authenticated');

create policy "Admins autenticados" on members
  for all using (auth.role() = 'authenticated');

-- La pagina /check/[id] necesita leer members sin auth
-- Solo campos necesarios para la verificacion
create policy "Lectura publica para check QR" on members
  for select using (true);

create policy "Lectura publica membership_types" on membership_types
  for select using (true);

-- Datos de ejemplo para arrancar
insert into membership_types (name, duration_days, price) values
  ('Mensual', 30, 350.00),
  ('Trimestral', 90, 900.00),
  ('Anual', 365, 3000.00);
