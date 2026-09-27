/* Buzón compartido en la nube (Supabase) con respaldo local.
   Si hay PUBLIC_SUPABASE_URL + PUBLIC_SUPABASE_ANON_KEY en el entorno,
   todo opera contra la base compartida; si no, el sitio usa el modo
   local (localStorage) sin romperse. */

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Consulta, EstadoConsulta } from './consultas';
import type { AdminUser, RolAdmin } from './admins';

export function esNube(): boolean {
	try {
		return Boolean(
			import.meta.env.PUBLIC_SUPABASE_URL && import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
		);
	} catch {
		return false;
	}
}

let cliente: SupabaseClient | null = null;

export function sb(): SupabaseClient | null {
	if (!esNube()) return null;
	if (!cliente) {
		cliente = createClient(
			import.meta.env.PUBLIC_SUPABASE_URL,
			import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
		);
	}
	return cliente;
}

/** Diagnóstico para el login: ¿el panel ve a Supabase? */
export async function probarConexion(): Promise<'local' | 'ok' | 'error'> {
	if (!esNube()) return 'local';
	try {
		const c = sb()!;
		// Lectura mínima: RLS puede devolver 0 filas, igual prueba
		// que el proyecto responde (los errores de red lanzan excepción).
		await c.from('admins').select('id', { head: true, count: 'exact' });
		return 'ok';
	} catch {
		return 'error';
	}
}

interface FilaConsulta {
	id: string;
	nombre: string;
	correo: string;
	tema: string;
	mensaje: string;
	estado: EstadoConsulta;
	respuesta: string | null;
	respondida_por: string | null;
	created_at: string;
}

function aConsulta(f: FilaConsulta): Consulta {
	return {
		id: f.id,
		nombre: f.nombre,
		correo: f.correo,
		tema: f.tema,
		mensaje: f.mensaje,
		estado: f.estado,
		respuesta: f.respuesta || undefined,
		respondidaPor: f.respondida_por || undefined,
		fecha: f.created_at,
	};
}

/* ---------- buzón ---------- */

export async function crearNube(input: {
	nombre: string;
	correo: string;
	tema: string;
	mensaje: string;
}): Promise<boolean> {
	const c = sb();
	if (!c) return false;
	const { error } = await c.from('consultas').insert(input);
	return !error;
}

export async function listarNube(): Promise<Consulta[]> {
	const c = sb();
	if (!c) return [];
	const { data, error } = await c
		.from('consultas')
		.select('*')
		.order('created_at', { ascending: false });
	if (error || !data) return [];
	return (data as FilaConsulta[]).map(aConsulta);
}

/** Llama a `cb` cada vez que cambia el buzón (tiempo real). Devuelve limpieza. */
export function suscribirNube(cb: () => void): () => void {
	const c = sb();
	if (!c) return () => {};
	const canal = c
		.channel('kora-consultas')
		.on(
			'postgres_changes',
			{ event: '*', schema: 'public', table: 'consultas' },
			() => cb(),
		)
		.subscribe();
	return () => {
		c.removeChannel(canal);
	};
}

export async function responderNube(id: string, respuesta: string, por: string): Promise<boolean> {
	const c = sb();
	if (!c) return false;
	const { error } = await c
		.from('consultas')
		.update({ respuesta, respondida_por: por, estado: 'respondida' })
		.eq('id', id);
	return !error;
}

export async function eliminarNube(id: string): Promise<boolean> {
	const c = sb();
	if (!c) return false;
	const { error } = await c.from('consultas').delete().eq('id', id);
	return !error;
}

/* ---------- equipo ---------- */

interface FilaAdmin {
	id: string;
	nombre: string;
	rol: RolAdmin;
	activa: boolean;
	created_at: string;
}

function aAdmin(f: FilaAdmin, email: string): AdminUser {
	return {
		id: f.id,
		nombre: f.nombre,
		usuario: email,
		passHash: '',
		rol: f.rol,
		creada: f.created_at,
		activa: f.activa,
	};
}

export type ErrorLogin = 'credenciales' | 'permisos' | 'conexion';

export async function loginNube(
	email: string,
	clave: string,
): Promise<{ ok: true; admin: AdminUser } | { ok: false; error: ErrorLogin }> {
	const c = sb();
	if (!c) return { ok: false, error: 'conexion' };
	try {
		const { data, error } = await c.auth.signInWithPassword({ email, password: clave });
		if (error || !data.user) return { ok: false, error: 'credenciales' };
		const { data: fila, error: qError } = await c
			.from('admins')
			.select('*')
			.eq('id', data.user.id)
			.maybeSingle();
		if (qError) {
			await c.auth.signOut();
			return { ok: false, error: 'conexion' };
		}
		if (!fila || !(fila as FilaAdmin).activa) {
			await c.auth.signOut();
			return { ok: false, error: 'permisos' };
		}
		return { ok: true, admin: aAdmin(fila as FilaAdmin, data.user.email || email) };
	} catch {
		return { ok: false, error: 'conexion' };
	}
}

export async function logoutNube() {
	await sb()?.auth.signOut();
}

export async function sesionNube(): Promise<AdminUser | null> {
	const c = sb();
	if (!c) return null;
	const { data } = await c.auth.getSession();
	const user = data.session?.user;
	if (!user) return null;
	const { data: fila } = await c
		.from('admins')
		.select('*')
		.eq('id', user.id)
		.maybeSingle();
	if (!fila || !(fila as FilaAdmin).activa) {
		await c.auth.signOut();
		return null;
	}
	return aAdmin(fila as FilaAdmin, user.email || '');
}

export async function listarEquipoNube(): Promise<AdminUser[]> {
	const c = sb();
	if (!c) return [];
	const { data } = await c.from('admins').select('*').order('created_at');
	return ((data || []) as FilaAdmin[]).map((f) => aAdmin(f, ''));
}

export async function setActivaNube(id: string, activa: boolean): Promise<boolean> {
	const c = sb();
	if (!c) return false;
	const { error } = await c.from('admins').update({ activa }).eq('id', id);
	return !error;
}

/** La propia administradora cambia su clave (Auth). */
export async function cambiarMiClaveNube(nueva: string): Promise<boolean> {
	const c = sb();
	if (!c || nueva.length < 4) return false;
	const { error } = await c.auth.updateUser({ password: nueva });
	return !error;
}
