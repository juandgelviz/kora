/* Cuentas de administradoras 100% locales (localStorage, sin nube).
   Límites honestos: esto NO es seguridad real. Cualquiera con acceso a este
   navegador/dispositivo puede leer o modificar estos datos. Sirve para operar
   el buzón en un equipo de confianza, no como control de acceso serio. */

export type RolAdmin = 'super' | 'admin';

export interface AdminUser {
	id: string;
	nombre: string;
	usuario: string;
	passHash: string;
	rol: RolAdmin;
	creada: string;
	activa: boolean;
}

/* Superadministrador propietario (todos los permisos) */
const SUPER_NOMBRE = 'Juan David Gelviz';
const SUPER_USUARIO = 'juandavid';
const SUPER_CLAVE_INICIAL = 'Kora2026*';

const KEY = 'kora-admins';

function cyrb53(input: string, seed = 0): string {
	let h1 = 0xdeadbeef ^ seed;
	let h2 = 0x41c6ce57 ^ seed;
	for (let i = 0; i < input.length; i++) {
		const ch = input.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 2654435761);
		h2 = Math.imul(h2 ^ ch, 1597334677);
	}
	h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
	h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
	return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

export async function hashClave(clave: string): Promise<string> {
	const hashes = await hashesCompatibles(clave);
	return hashes[0];
}

/** Todas las variantes aceptadas (migración sha256 ↔ respaldo local). */
export async function hashesCompatibles(clave: string): Promise<string[]> {
	const base = `kora-local:${clave}`;
	try {
		if (typeof crypto !== 'undefined' && crypto.subtle) {
			const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(base));
			return [
				'sha256:' +
					Array.from(new Uint8Array(buf))
						.map((b) => b.toString(16).padStart(2, '0'))
						.join(''),
				`cyrb53:${cyrb53(base)}`,
			];
		}
	} catch {
		/* sin SubtleCrypto (contexto no seguro): respaldo local */
	}
	return [`cyrb53:${cyrb53(base)}`];
}

function leer(): AdminUser[] {
	try {
		const raw = localStorage.getItem(KEY);
		const data = raw ? JSON.parse(raw) : [];
		if (!Array.isArray(data)) return [];
		// Migración: cuentas anteriores sin rol pasan a administradoras.
		return data.map((a) => ({ ...a, rol: (a.rol as RolAdmin) || 'admin' }));
	} catch {
		return [];
	}
}

function guardar(items: AdminUser[]) {
	localStorage.setItem(KEY, JSON.stringify(items));
}

function nuevoId(): string {
	return typeof crypto !== 'undefined' && 'randomUUID' in crypto
		? crypto.randomUUID()
		: `a-${Date.now()}`;
}

export function listarAdmins(): AdminUser[] {
	asegurarSuperadmin();
	return leer().sort((a, b) => {
		if (a.rol !== b.rol) return a.rol === 'super' ? -1 : 1;
		return a.creada > b.creada ? 1 : -1;
	});
}

/** Garantiza que exista la cuenta superadministradora propietaria. */
function asegurarSuperadmin() {
	try {
		const items = leer();
		if (items.some((a) => a.rol === 'super')) return;
		const base = SUPER_USUARIO;
		const usuario = items.some((a) => a.usuario === base) ? `${base}.admin` : base;
		const seed: AdminUser = {
			id:
				typeof crypto !== 'undefined' && 'randomUUID' in crypto
					? crypto.randomUUID()
					: `a-${Date.now()}`,
			nombre: SUPER_NOMBRE,
			usuario,
			// Hash síncrono para poder sembrar; se actualiza a SHA-256
			// automáticamente cuando Juan cambie su clave en el panel.
			passHash: `cyrb53:${cyrb53(`kora-local:${SUPER_CLAVE_INICIAL}`)}`,
			rol: 'super',
			creada: new Date().toISOString(),
			activa: true,
		};
		guardar([...items, seed]);
	} catch {
		/* almacenamiento no disponible */
	}
}

export async function crearAdmin(input: {
	nombre: string;
	usuario: string;
	clave: string;
	rol?: RolAdmin;
}): Promise<{ ok: boolean; error?: string }> {
	const usuario = input.usuario.trim().toLowerCase();
	if (!input.nombre.trim() || !usuario || input.clave.length < 4) {
		return { ok: false, error: 'Completa nombre, usuario y una clave de mínimo 4 caracteres.' };
	}
	if (leer().some((a) => a.usuario === usuario)) {
		return { ok: false, error: 'Ese usuario ya existe.' };
	}
	const admin: AdminUser = {
		id: nuevoId(),
		nombre: input.nombre.trim(),
		usuario,
		passHash: await hashClave(input.clave),
		rol: input.rol || 'admin',
		creada: new Date().toISOString(),
		activa: true,
	};
	guardar([...leer(), admin]);
	return { ok: true };
}

export async function verificarAcceso(usuario: string, clave: string): Promise<AdminUser | null> {
	const admin = leer().find((a) => a.usuario === usuario.trim().toLowerCase());
	if (!admin || !admin.activa) return null;
	const variantes = await hashesCompatibles(clave);
	return variantes.includes(admin.passHash) ? admin : null;
}

export function cambiarEstadoAdmin(id: string, activa: boolean) {
	guardar(leer().map((a) => (a.id === id ? { ...a, activa } : a)));
}

export function eliminarAdmin(id: string) {
	guardar(leer().filter((a) => a.id !== id));
}

export async function cambiarClaveAdmin(id: string, nueva: string): Promise<boolean> {
	if (nueva.length < 4) return false;
	const hash = await hashClave(nueva);
	guardar(leer().map((a) => (a.id === id ? { ...a, passHash: hash } : a)));
	return true;
}
