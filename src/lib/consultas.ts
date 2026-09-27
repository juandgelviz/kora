/* Buzón local de consultas (sin nube): persiste en localStorage del navegador.
   Límites honestos: cualquier persona con acceso a este navegador/dispositivo
   puede leer estos datos. No es un sistema seguro multiusuario; para
   privacidad real se necesitaría un backend con autenticación. */

export type EstadoConsulta = 'pendiente' | 'respondida';

export interface Consulta {
	id: string;
	nombre: string;
	correo: string;
	tema: string;
	mensaje: string;
	estado: EstadoConsulta;
	respuesta?: string;
	respondidaPor?: string;
	fecha: string;
	fechaRespuesta?: string;
	ejemplo?: boolean;
}

const KEY = 'kora-consultas';
const SEED_KEY = 'kora-consultas-seed';

const SEMILLAS: Consulta[] = [
	{
		id: 'seed-1',
		nombre: 'Ejemplo: Carolina R.',
		correo: 'ejemplo@correo.com',
		tema: 'Despido o renuncia',
		mensaje:
			'Ejemplo de consulta: me terminaron el contrato verbal sin liquidación. ¿Qué debo pedir por escrito?',
		estado: 'respondida',
		respuesta:
			'Ejemplo de respuesta: solicita por escrito la liquidación con prima, cesantías y vacaciones, y guarda todo soporte.',
		fecha: new Date().toISOString(),
		ejemplo: true,
	},
	{
		id: 'seed-2',
		nombre: 'Ejemplo: Andrés M.',
		correo: 'ejemplo@correo.com',
		tema: 'Salario y pagos',
		mensaje: 'Ejemplo de consulta: no me pagaron las horas extra del último mes.',
		estado: 'pendiente',
		fecha: new Date().toISOString(),
		ejemplo: true,
	},
];

function leer(): Consulta[] {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return [];
		const data = JSON.parse(raw);
		return Array.isArray(data) ? data : [];
	} catch {
		return [];
	}
}

function guardarTodas(items: Consulta[]) {
	localStorage.setItem(KEY, JSON.stringify(items));
}

export function sembrarSiVacio() {
	try {
		if (!localStorage.getItem(KEY) && !localStorage.getItem(SEED_KEY)) {
			guardarTodas(SEMILLAS);
			localStorage.setItem(SEED_KEY, '1');
		}
	} catch {
		/* almacenamiento no disponible: se opera en memoria vacía */
	}
}

export function listarConsultas(): Consulta[] {
	sembrarSiVacio();
	return leer().sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
}

export function crearConsulta(input: {
	nombre: string;
	correo: string;
	tema: string;
	mensaje: string;
}): Consulta {
	const nueva: Consulta = {
		id:
			typeof crypto !== 'undefined' && 'randomUUID' in crypto
				? crypto.randomUUID()
				: `c-${Date.now()}`,
		estado: 'pendiente',
		fecha: new Date().toISOString(),
		...input,
	};
	guardarTodas([nueva, ...leer()]);
	return nueva;
}

export function responderConsulta(id: string, respuesta: string, por: string) {
	guardarTodas(
		leer().map((c) =>
			c.id === id
				? {
						...c,
						respuesta,
						respondidaPor: por,
						estado: 'respondida' as EstadoConsulta,
						fechaRespuesta: new Date().toISOString(),
					}
				: c,
		),
	);
}

export function eliminarConsulta(id: string) {
	guardarTodas(leer().filter((c) => c.id !== id));
}
