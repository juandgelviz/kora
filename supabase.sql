-- ============================================================
-- KORA · Esquema Supabase (buen compartido en la nube)
-- Cómo usarlo: Supabase Dashboard → SQL Editor → pegar todo
-- y ejecutar (Run). Solo hay que hacerlo UNA vez.
-- ============================================================

-- 1. Tabla de consultas del buzón
create table if not exists public.consultas (
	id uuid primary key default gen_random_uuid(),
	nombre text not null,
	correo text not null,
	tema text not null default 'Otro tema',
	mensaje text not null,
	estado text not null default 'pendiente' check (estado in ('pendiente', 'respondida')),
	respuesta text,
	respondida_por text,
	created_at timestamptz not null default now()
);

-- 2. Tabla de administradoras (id = UUID del usuario en Auth)
create table if not exists public.admins (
	id uuid primary key references auth.users (id) on delete cascade,
	nombre text not null,
	rol text not null default 'admin' check (rol in ('super', 'admin')),
	activa boolean not null default true,
	created_at timestamptz not null default now()
);

-- 3. Seguridad a nivel de fila
alter table public.consultas enable row level security;
alter table public.admins enable row level security;

-- Funciones con permisos elevados (evitan recursión infinita al
-- consultar la tabla `admins` desde sus propias políticas)
create or replace function public.es_admin_activa()
returns boolean
language sql
security definer
set search_path = public
as $$
	select exists (
		select 1 from public.admins where id = auth.uid() and activa
	);
$$;

create or replace function public.es_superactiva()
returns boolean
language sql
security definer
set search_path = public
as $$
	select exists (
		select 1 from public.admins where id = auth.uid() and rol = 'super' and activa
	);
$$;

grant execute on function public.es_admin_activa() to authenticated;
grant execute on function public.es_superactiva() to authenticated;

-- El público puede ENVIAR consultas (nadie puede leerlas sin login)
drop policy if exists "Envío público de consultas" on public.consultas;
create policy "Envío público de consultas"
	on public.consultas for insert
	to anon, authenticated
	with check (true);

-- Solo administradoras activas pueden VER, RESPONDER y ELIMINAR
drop policy if exists "Lectura de administradoras" on public.consultas;
create policy "Lectura de administradoras"
	on public.consultas for select
	to authenticated
	using (public.es_admin_activa());

drop policy if exists "Respuesta de administradoras" on public.consultas;
create policy "Respuesta de administradoras"
	on public.consultas for update
	to authenticated
	using (public.es_admin_activa())
	with check (public.es_admin_activa());

drop policy if exists "Eliminación de administradoras" on public.consultas;
create policy "Eliminación de administradoras"
	on public.consultas for delete
	to authenticated
	using (public.es_admin_activa());

-- El equipo se ve entre administradoras; solo la super lo gestiona
drop policy if exists "Ver equipo" on public.admins;
create policy "Ver equipo"
	on public.admins for select
	to authenticated
	using (public.es_admin_activa());

drop policy if exists "Gestión de superadministradora" on public.admins;
create policy "Gestión de superadministradora"
	on public.admins for update
	to authenticated
	using (public.es_superactiva())
	with check (public.es_superactiva());

-- 4. Tiempo real: las preguntas nuevas aparecen solas en /admin
-- (Solo la agrega si aún no es miembro: repetir el script es seguro.)
do $$
begin
	if not exists (
		select 1 from pg_publication_tables
		where pubname = 'supabase_realtime'
			and schemaname = 'public'
			and tablename = 'consultas'
	) then
		alter publication supabase_realtime add table public.consultas;
	end if;
end $$;
