import { useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import {
	Lock,
	Trash2,
	Send,
	Inbox,
	CircleCheck,
	Clock3,
	LogOut,
	UserX,
	UserCheck,
	UserPlus,
	KeyRound,
	Search,
} from 'lucide-react';
import {
	listarConsultas,
	responderConsulta,
	eliminarConsulta,
} from '../lib/consultas';
import {
	listarAdmins,
	crearAdmin,
	verificarAcceso,
	cambiarEstadoAdmin,
	eliminarAdmin,
	cambiarClaveAdmin,
} from '../lib/admins';
import {
	esNube,
	loginNube,
	logoutNube,
	sesionNube,
	listarNube,
	suscribirNube,
	responderNube,
	eliminarNube,
	listarEquipoNube,
	setActivaNube,
	cambiarMiClaveNube,
	probarConexion,
} from '../lib/nube';
import type { Consulta } from '../lib/consultas';
import type { AdminUser } from '../lib/admins';

const NUBE = esNube();

function timeAgo(iso: string) {
	const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
	if (mins < 60) return `hace ${mins} min`;
	const hours = Math.round(mins / 60);
	if (hours < 24) return `hace ${hours} h`;
	return `hace ${Math.round(hours / 24)} d`;
}

type Filtro = 'todas' | 'pendiente' | 'respondida';
type Tab = 'consultas' | 'equipo' | 'cuenta';

const inputCls =
	'w-full rounded-xl border border-rojo-700/15 bg-white px-4 py-2.5 text-sm text-rojo-700 outline-none placeholder:text-rojo-700/40 transition-[border-color,box-shadow] focus:border-rojo-500 focus:ring-2 focus:ring-rojo-500/25';

export default function AdminPanel() {
	const [session, setSession] = useState<AdminUser | null>(null);
	const [checking, setChecking] = useState(NUBE);
	const [conexion, setConexion] = useState<'local' | 'ok' | 'error' | null>(null);
	const [admins, setAdmins] = useState<AdminUser[]>(() => (NUBE ? [] : listarAdmins()));
	const [items, setItems] = useState<Consulta[]>(() => (NUBE ? [] : listarConsultas()));
	const [tab, setTab] = useState<Tab>('consultas');
	const [filtro, setFiltro] = useState<Filtro>('todas');
	const [busqueda, setBusqueda] = useState('');
	const [openId, setOpenId] = useState<string | null>(null);
	const [drafts, setDrafts] = useState<Record<string, string>>({});

	const [usuario, setUsuario] = useState('');
	const [clave, setClave] = useState('');
	const [nombre, setNombre] = useState('');
	const [authError, setAuthError] = useState('');
	const [working, setWorking] = useState(false);

	const [nuevo, setNuevo] = useState({ nombre: '', usuario: '', clave: '' });
	const [equipoError, setEquipoError] = useState('');
	const [resetId, setResetId] = useState<string | null>(null);
	const [resetClave, setResetClave] = useState('');
	const [resetOk, setResetOk] = useState('');
	const [miClave, setMiClave] = useState('');
	const [miClaveOk, setMiClaveOk] = useState(false);

	const refreshConsultas = NUBE
		? () => {
				listarNube().then(setItems);
			}
		: () => setItems(listarConsultas());
	const refreshAdmins = NUBE
		? () => {
				listarEquipoNube().then(setAdmins);
			}
		: () => setAdmins(listarAdmins());
	const esSuper = session?.rol === 'super';

	/* Sesión persistente + tiempo real (nube) */
	useEffect(() => {
		probarConexion().then(setConexion);
		if (!NUBE) return;
		sesionNube().then((a) => {
			setSession(a);
			setChecking(false);
			if (a) {
				listarNube().then(setItems);
				listarEquipoNube().then(setAdmins);
			}
		});
	}, []);

	useEffect(() => {
		if (!NUBE || !session) return;
		return suscribirNube(() => listarNube().then(setItems));
	}, [session]);

	/* ---------- acceso ---------- */

	const entrar = async () => {
		if (working) return;
		setWorking(true);
		setAuthError('');
		if (NUBE) {
			const res = await loginNube(usuario, clave);
			setWorking(false);
			if (res.ok) {
				setSession(res.admin);
				setUsuario('');
				setClave('');
				refreshConsultas();
				refreshAdmins();
			} else if (res.error === 'credenciales') {
				setAuthError('Correo o clave incorrectos.');
			} else if (res.error === 'permisos') {
				setAuthError(
					'Entraste bien, pero tu usuario no tiene fila activa en la tabla admins. Verifica que el id sea tu UID.',
				);
			} else {
				setAuthError(
					'Fallo de conexión o permisos (RLS). Vuelve a ejecutar supabase.sql en el SQL Editor.',
				);
			}
			return;
		}
		const admin = await verificarAcceso(usuario, clave);
		setWorking(false);
		if (admin) {
			setSession(admin);
			setUsuario('');
			setClave('');
			refreshConsultas();
			refreshAdmins();
		} else {
			setAuthError('Usuario, clave o estado inválido.');
		}
	};

	const crearPrimera = async () => {
		if (working) return;
		setWorking(true);
		setAuthError('');
		const res = await crearAdmin({ nombre, usuario, clave, rol: 'super' });
		setWorking(false);
		if (res.ok) {
			const admin = await verificarAcceso(usuario, clave);
			setSession(admin);
			setNombre('');
			setUsuario('');
			setClave('');
			refreshAdmins();
			refreshConsultas();
		} else {
			setAuthError(res.error || 'No se pudo crear la cuenta.');
		}
	};

	const salir = async () => {
		if (NUBE) await logoutNube();
		setSession(null);
		setTab('consultas');
	};

	/* ---------- equipo (solo super, modo local) ---------- */

	const agregarAdmin = async () => {
		setEquipoError('');
		const res = await crearAdmin(nuevo);
		if (res.ok) {
			setNuevo({ nombre: '', usuario: '', clave: '' });
			refreshAdmins();
		} else {
			setEquipoError(res.error || 'No se pudo crear.');
		}
	};

	const guardarReset = async (id: string) => {
		if (resetClave.length < 4) return;
		const ok = await cambiarClaveAdmin(id, resetClave);
		if (ok) {
			setResetOk('Clave actualizada.');
			setResetClave('');
			setResetId(null);
			window.setTimeout(() => setResetOk(''), 3000);
		}
	};

	const quitarAdmin = (a: AdminUser) => {
		if (a.id === session?.id) return;
		const supers = admins.filter((x) => x.rol === 'super' && x.activa);
		if (a.rol === 'super' && supers.length <= 1) {
			window.alert('No puedes eliminar a la última cuenta superadministrador.');
			return;
		}
		if (window.confirm(`¿Eliminar la cuenta de ${a.nombre} (@${a.usuario})?`)) {
			eliminarAdmin(a.id);
			refreshAdmins();
		}
	};

	const alternarActiva = async (a: AdminUser) => {
		if (NUBE) {
			if (await setActivaNube(a.id, !a.activa)) refreshAdmins();
		} else {
			cambiarEstadoAdmin(a.id, !a.activa);
			refreshAdmins();
		}
	};

	/* ---------- login / setup ---------- */

	if (checking) {
		return (
			<p className="mx-auto w-full max-w-md py-16 text-center text-sm text-rojo-700/60">
				Verificando sesión…
			</p>
		);
	}

	if (!session) {
		const esSetup = !NUBE && admins.length === 0;
		return (
			<MotionConfig reducedMotion="user">
			<motion.div
				initial={{ opacity: 0, y: 28 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
				className="mx-auto w-full max-w-md rounded-2xl border border-rojo-700/10 bg-white p-8 text-center shadow-[0_24px_48px_-32px_rgba(46,5,5,0.4)]"
			>
				<span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-rojo-200 text-rojo-600">
					<Lock size={26} aria-hidden="true" />
				</span>
				{conexion && (
					<p
						className={`mx-auto mt-4 flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
							conexion === 'ok'
								? 'bg-rojo-600 text-white'
								: conexion === 'error'
									? 'border border-rojo-600 bg-white text-rojo-600'
									: 'bg-rojo-100 text-rojo-700'
						}`}
					>
						<span
							className={`h-2 w-2 rounded-full ${
								conexion === 'ok' ? 'bg-white' : 'bg-rojo-600'
							}`}
							aria-hidden="true"
						/>
						{conexion === 'ok' && 'Nube conectada'}
						{conexion === 'error' && 'Sin conexión a Supabase: revisa el .env y reinicia el dev'}
						{conexion === 'local' && 'Modo local (sin .env)'}
					</p>
				)}
				<h1 className="mt-4 text-3xl text-rojo-700">
					{esSetup ? 'Crea la primera administradora' : 'Acceso de administradoras'}
				</h1>
				<p className="mt-2 text-sm leading-relaxed text-rojo-700/70">
					{esSetup
						? 'Aún no hay cuentas. La primera cuenta creada tendrá todos los permisos.'
						: NUBE
							? 'Ingresa con tu correo y clave de administradora.'
							: 'Ingresa con tu usuario y clave. Esta página no está enlazada en el menú público.'}
				</p>
				<div className="mt-6 flex flex-col gap-2 text-left">
					{esSetup && (
						<label className="flex flex-col gap-1.5 text-sm font-medium text-rojo-700">
							Nombre
							<input
								value={nombre}
								onChange={(e) => setNombre(e.target.value)}
								placeholder="Ej. María ER"
								className={inputCls}
							/>
						</label>
					)}
					<label className="flex flex-col gap-1.5 text-sm font-medium text-rojo-700">
						{NUBE ? 'Correo' : 'Usuario'}
						<input
							value={usuario}
							onChange={(e) => setUsuario(e.target.value)}
							placeholder={NUBE ? 'tu@correo.com' : 'Ej. maria'}
							autoComplete={NUBE ? 'email' : 'username'}
							className={inputCls}
						/>
					</label>
					<label className="flex flex-col gap-1.5 text-sm font-medium text-rojo-700">
						Clave
						<input
							type="password"
							value={clave}
							onChange={(e) => setClave(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && (esSetup ? crearPrimera() : entrar())}
							placeholder="Tu clave"
							autoComplete={esSetup ? 'new-password' : 'current-password'}
							className={inputCls}
						/>
					</label>
					<motion.button
						type="button"
						disabled={working}
						onClick={esSetup ? crearPrimera : entrar}
						whileTap={{ scale: 0.98 }}
						className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-rojo-600 px-6 py-3 text-sm font-semibold text-white transition-[background-color] hover:bg-rojo-500 disabled:opacity-60"
					>
						{working && <span className="spinner" aria-hidden="true" />}
						{working ? 'Verificando…' : esSetup ? 'Crear cuenta y entrar' : 'Entrar'}
					</motion.button>
				</div>
				<AnimatePresence>
					{authError && (
						<motion.p
							key="auth-error"
							initial={{ opacity: 0, y: -6 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="mt-3 text-sm font-medium text-rojo-600"
						>
							{authError}
						</motion.p>
					)}
				</AnimatePresence>
				{NUBE && (
					<p className="mt-3 text-xs leading-relaxed text-rojo-700/50">
						¿Sin cuenta? Pídeleal superadministrador que te cree en el panel
						de Supabase (ver GUIA_NUBE.md).
					</p>
				)}
			</motion.div>
			</MotionConfig>
		);
	}

	/* ---------- datos derivados ---------- */

	const q = busqueda.trim().toLowerCase();
	const visibles = items
		.filter((c) => (filtro === 'todas' ? true : c.estado === filtro))
		.filter((c) =>
			q
				? [c.nombre, c.correo, c.tema, c.mensaje]
						.join(' ')
						.toLowerCase()
						.includes(q)
				: true,
		);
	const pendientes = items.filter((c) => c.estado === 'pendiente').length;
	const respondidas = items.length - pendientes;

	const stats = [
		{ label: 'Total', value: items.length, icon: Inbox, go: () => { setTab('consultas'); setFiltro('todas'); } },
		{ label: 'Pendientes', value: pendientes, icon: Clock3, go: () => { setTab('consultas'); setFiltro('pendiente'); } },
		{ label: 'Respondidas', value: respondidas, icon: CircleCheck, go: () => { setTab('consultas'); setFiltro('respondida'); } },
	];

	const responder = async (id: string) => {
		const texto = (drafts[id] || '').trim();
		if (!texto) return;
		const ok = NUBE
			? await responderNube(id, texto, session.nombre)
			: (responderConsulta(id, texto, session.nombre), true);
		if (ok) {
			setDrafts((d) => ({ ...d, [id]: '' }));
			refreshConsultas();
		}
	};

	const eliminar = async (id: string) => {
		const ok = NUBE ? await eliminarNube(id) : (eliminarConsulta(id), true);
		if (ok) refreshConsultas();
	};

	/* ---------- panel ---------- */

	return (
		<MotionConfig reducedMotion="user">
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
			className="mx-auto w-full max-w-6xl"
		>
			{/* Barra superior */}
			<div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-rojo-700/10 bg-white p-4 sm:p-5">
				<div className="flex items-center gap-3">
					<img
						src="/logo.png"
						alt=""
						width={40}
						height={40}
						className="h-10 w-10 rounded-full object-cover"
					/>
					<div>
						<p className="font-display text-xl leading-none text-rojo-700">
							Panel KORA {NUBE && <span className="text-sm text-rojo-700/50">· nube</span>}
						</p>
						<p className="mt-1 text-xs text-rojo-700/60">Administración del buzón</p>
					</div>
				</div>
				<div className="flex items-center gap-3">
					<span className="hidden text-right sm:block">
						<span className="block text-sm font-semibold text-rojo-700">{session.nombre}</span>
						<span className="mt-0.5 flex items-center justify-end gap-1 text-xs text-rojo-700/60">
							{esSuper ? 'Superadministrador' : 'Administradora'} · @{session.usuario}
						</span>
					</span>
					<span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rojo-600 text-sm font-bold text-white">
						{session.nombre.charAt(0).toUpperCase()}
					</span>
					<button
						type="button"
						onClick={salir}
						className="inline-flex items-center gap-2 rounded-full border border-rojo-700/15 bg-white px-4 py-2.5 text-sm font-semibold text-rojo-700 transition-[background-color] hover:bg-rojo-100 active:scale-[0.97]"
					>
						<LogOut size={16} aria-hidden="true" />
						Salir
					</button>
				</div>
			</div>

			{/* Métricas */}
			<div className="mt-4 grid grid-cols-3 gap-3 sm:gap-4">
				{stats.map((s, i) => (
					<motion.button
						key={s.label}
						type="button"
						onClick={s.go}
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: 0.1 + i * 0.07, ease: [0.23, 1, 0.32, 1] }}
						className="group rounded-2xl border border-rojo-700/10 bg-white p-4 text-left transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-20px_rgba(46,5,5,0.4)] sm:p-5"
					>
						<span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rojo-200 text-rojo-600 transition-transform duration-200 group-hover:scale-105">
							<s.icon size={19} aria-hidden="true" />
						</span>
						<span className="font-display mt-3 block text-3xl leading-none text-rojo-700 sm:text-4xl">
							{s.value}
						</span>
						<span className="mt-1 block text-xs font-medium text-rojo-700/60 sm:text-sm">
							{s.label}
						</span>
					</motion.button>
				))}
			</div>

			{/* Pestañas */}
			<div className="mt-6 flex gap-2" role="tablist" aria-label="Secciones del panel">
				{(
					[
						{ id: 'consultas', label: 'Consultas' },
						...(session.rol === 'super' ? [{ id: 'equipo', label: `Equipo (${admins.filter((a) => a.activa).length})` }] : []),
						{ id: 'cuenta', label: 'Mi cuenta' },
					] as { id: Tab; label: string }[]
				).map((t) => (
					<button
						key={t.id}
						type="button"
						role="tab"
						aria-selected={tab === t.id}
						onClick={() => setTab(t.id)}
						className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-[background-color,color] ${
							tab === t.id
								? 'bg-rojo-600 text-white'
								: 'border border-rojo-700/15 bg-white text-rojo-700 hover:bg-rojo-100'
						}`}
					>
						{t.label}
					</button>
				))}
			</div>

			<AnimatePresence mode="wait">
			{tab === 'consultas' && (
				<motion.div
					key="tab-consultas"
					initial={{ opacity: 0, y: 14 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -8 }}
					transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
				>
					<div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
						<label className="relative flex-1">
							<Search
								size={17}
								className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-rojo-700/40"
								aria-hidden="true"
							/>
							<input
								value={busqueda}
								onChange={(e) => setBusqueda(e.target.value)}
								placeholder="Buscar por nombre, tema o palabra…"
								aria-label="Buscar consultas"
								className="w-full rounded-full border border-rojo-700/15 bg-white py-2.5 pr-4 pl-11 text-sm text-rojo-700 outline-none placeholder:text-rojo-700/40 focus:border-rojo-500 focus:ring-2 focus:ring-rojo-500/25"
							/>
						</label>
						<div className="flex gap-2" role="tablist" aria-label="Filtrar por estado">
							{(
								[
									{ id: 'todas', label: `Todas` },
									{ id: 'pendiente', label: `Pendientes` },
									{ id: 'respondida', label: `Respondidas` },
								] as const
							).map((f) => (
								<button
									key={f.id}
									type="button"
									role="tab"
									aria-selected={filtro === f.id}
									onClick={() => setFiltro(f.id)}
									className={`rounded-full px-4 py-2 text-sm font-medium transition-[background-color,color] ${
										filtro === f.id
											? 'bg-rojo-700 text-white'
											: 'bg-white text-rojo-700/70 hover:bg-rojo-100'
									}`}
								>
									{f.label}
								</button>
							))}
						</div>
					</div>

					{visibles.length === 0 ? (
						<div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-rojo-700/20 bg-white p-12 text-center">
							<Inbox size={32} className="text-rojo-700/40" aria-hidden="true" />
							<p className="mt-3 font-medium text-rojo-700">Nada por aquí.</p>
							<p className="mt-1 text-sm text-rojo-700/60">
								{q ? 'Ninguna consulta coincide con la búsqueda.' : 'No hay consultas en este estado.'}
							</p>
						</div>
					) : (
						<ul className="mt-6 flex flex-col gap-4">
							<AnimatePresence initial={false}>
								{visibles.map((c) => {
									const open = openId === c.id;
									return (
										<motion.li
											key={c.id}
											layout
											initial={{ opacity: 0, y: 12 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, scale: 0.98 }}
											transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
											className="overflow-hidden rounded-2xl border border-rojo-700/10 bg-white"
										>
											<button
												type="button"
												onClick={() => setOpenId(open ? null : c.id)}
												aria-expanded={open}
												className="flex w-full items-center gap-3 p-5 text-left transition-[background-color] hover:bg-rojo-100/60"
											>
												<span
													className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
														c.estado === 'pendiente'
															? 'bg-rojo-200 text-rojo-600'
															: 'bg-rojo-600 text-white'
													}`}
												>
													{c.estado === 'pendiente' ? (
														<Clock3 size={18} aria-hidden="true" />
													) : (
														<CircleCheck size={18} aria-hidden="true" />
													)}
												</span>
												<span className="min-w-0 flex-1">
													<span className="flex flex-wrap items-center gap-2">
														<span className="truncate text-[15px] font-semibold text-rojo-700">
															{c.nombre} · {c.tema}
														</span>
														{c.ejemplo && (
															<span className="rounded-full bg-rojo-100 px-2 py-0.5 text-[11px] font-semibold text-rojo-600">
																Ejemplo
															</span>
														)}
													</span>
													<span className="mt-0.5 block truncate text-sm text-rojo-700/60">
														{c.mensaje} · {timeAgo(c.fecha)}
													</span>
												</span>
											</button>

											{open && (
												<div className="border-t border-rojo-700/10 p-5 pt-4">
													<p className="text-sm leading-relaxed text-rojo-700/80">
														<span className="font-semibold">Correo:</span> {c.correo}
													</p>
													<p className="mt-2 text-[15px] leading-relaxed text-rojo-700">
														{c.mensaje}
													</p>

													{c.respuesta ? (
														<div className="mt-4 rounded-xl bg-rojo-100 p-4">
															<p className="text-xs font-semibold tracking-wide text-rojo-600 uppercase">
																Respondida por {c.respondidaPor || 'el equipo'}
															</p>
															<p className="mt-1 text-sm leading-relaxed text-rojo-700">
																{c.respuesta}
															</p>
														</div>
													) : (
														<div className="mt-4 flex flex-col gap-2">
															<label
																htmlFor={`resp-${c.id}`}
																className="text-sm font-medium text-rojo-700"
															>
																Responder como {session.nombre}
															</label>
															<textarea
																id={`resp-${c.id}`}
																rows={3}
																value={drafts[c.id] || ''}
																onChange={(e) =>
																	setDrafts((d) => ({ ...d, [c.id]: e.target.value }))
																}
																placeholder="Escribe la orientación…"
																className="w-full rounded-xl border border-rojo-700/15 bg-white px-4 py-3 text-[15px] text-rojo-700 outline-none placeholder:text-rojo-700/40 focus:border-rojo-500 focus:ring-2 focus:ring-rojo-500/25"
															/>
															<div className="flex justify-end">
																<button
																	type="button"
																	disabled={!(drafts[c.id] || '').trim()}
																	onClick={() => responder(c.id)}
																	className="inline-flex items-center gap-2 rounded-full bg-rojo-600 px-5 py-2.5 text-sm font-semibold text-white transition-[transform,background-color] hover:bg-rojo-500 active:scale-[0.97] disabled:opacity-50"
																>
																	<Send size={15} aria-hidden="true" />
																	Guardar respuesta
																</button>
															</div>
														</div>
													)}

													<div className="mt-3 flex justify-end">
														<button
															type="button"
															onClick={() => eliminar(c.id)}
															className="inline-flex items-center gap-1.5 text-sm font-medium text-rojo-700/60 transition-colors hover:text-rojo-600"
														>
															<Trash2 size={15} aria-hidden="true" />
															Eliminar
														</button>
													</div>
												</div>
											)}
										</motion.li>
									);
								})}
							</AnimatePresence>
						</ul>
					)}
				</motion.div>
			)}

			{tab === 'equipo' && session.rol === 'super' && (
				<motion.div
					key="tab-equipo"
					initial={{ opacity: 0, y: 14 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -8 }}
					transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
					className="mt-6 flex flex-col gap-4"
				>
					{NUBE ? (
						<p className="rounded-2xl border border-rojo-700/10 bg-white p-5 text-sm leading-relaxed text-rojo-700/75">
							Las cuentas se crean en el panel de Supabase
							(Authentication → Add user + fila en <code>admins</code>, ver
							GUIA_NUBE.md). Aquí puedes activar o desactivar accesos.
						</p>
					) : (
						<div className="rounded-2xl border border-rojo-700/10 bg-white p-6">
							<p className="flex items-center gap-2 text-sm font-semibold text-rojo-700">
								<UserPlus size={17} aria-hidden="true" />
								Crear cuenta de administradora
							</p>
							<div className="mt-3 grid gap-2 sm:grid-cols-4">
								<input
									value={nuevo.nombre}
									onChange={(e) => setNuevo((n) => ({ ...n, nombre: e.target.value }))}
									placeholder="Nombre"
									aria-label="Nombre"
									className={inputCls}
								/>
								<input
									value={nuevo.usuario}
									onChange={(e) => setNuevo((n) => ({ ...n, usuario: e.target.value }))}
									placeholder="Usuario"
									aria-label="Usuario"
									className={inputCls}
								/>
								<input
									type="password"
									value={nuevo.clave}
									onChange={(e) => setNuevo((n) => ({ ...n, clave: e.target.value }))}
									placeholder="Clave (mín. 4)"
									aria-label="Clave"
									className={inputCls}
								/>
								<button
									type="button"
									onClick={agregarAdmin}
									className="rounded-xl bg-rojo-600 px-4 py-2.5 text-sm font-semibold text-white transition-[transform,background-color] hover:bg-rojo-500 active:scale-[0.97]"
								>
									Crear
								</button>
							</div>
							{equipoError && (
								<p className="mt-2 text-sm font-medium text-rojo-600">{equipoError}</p>
							)}
						</div>
					)}

					{resetOk && (
						<p className="rounded-2xl bg-rojo-600 px-5 py-3 text-sm font-semibold text-white">
							{resetOk}
						</p>
					)}

					<ul className="flex flex-col gap-3">
						{admins.map((a) => (
							<li
								key={a.id}
								className="rounded-2xl border border-rojo-700/10 bg-white p-4"
							>
								<div className="flex flex-wrap items-center gap-3">
									<span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rojo-200 text-sm font-bold text-rojo-600">
										{a.nombre.charAt(0).toUpperCase()}
									</span>
									<span className="min-w-0 flex-1">
										<span className="flex flex-wrap items-center gap-2 text-[15px] font-semibold text-rojo-700">
											{a.nombre}
											{a.rol === 'super' ? (
												<span className="rounded-full bg-rojo-600 px-2 py-0.5 text-[11px] font-semibold text-white">
													Super
												</span>
											) : (
												<span className="rounded-full bg-rojo-100 px-2 py-0.5 text-[11px] font-semibold text-rojo-600">
													Admin
												</span>
											)}
											{a.id === session.id && (
												<span className="rounded-full border border-rojo-700/20 px-2 py-0.5 text-[11px] font-semibold text-rojo-700/70">
													Tú
												</span>
											)}
										</span>
										<span className="block text-sm text-rojo-700/60">
											@{a.usuario} · {a.activa ? 'activa' : 'desactivada'}
										</span>
									</span>
									{a.id !== session.id && (
										<span className="flex gap-2">
											{!NUBE && (
												<button
													type="button"
													onClick={() => {
														setResetId(resetId === a.id ? null : a.id);
														setResetClave('');
													}}
													title="Cambiar su clave"
													className="flex h-10 items-center gap-1.5 rounded-full border border-rojo-700/15 px-3 text-sm font-semibold text-rojo-700 transition-[background-color] hover:bg-rojo-100 active:scale-[0.97]"
												>
													<KeyRound size={16} aria-hidden="true" />
													Clave
												</button>
											)}
											<button
												type="button"
												onClick={async () => {
													if (NUBE) {
														if (await setActivaNube(a.id, !a.activa)) refreshAdmins();
													} else {
														cambiarEstadoAdmin(a.id, !a.activa);
														refreshAdmins();
													}
												}}
												title={a.activa ? 'Desactivar acceso' : 'Reactivar acceso'}
												className="flex h-10 w-10 items-center justify-center rounded-full border border-rojo-700/15 text-rojo-700 transition-[background-color] hover:bg-rojo-100 active:scale-[0.95]"
											>
												{a.activa ? (
													<UserX size={17} aria-hidden="true" />
												) : (
													<UserCheck size={17} aria-hidden="true" />
												)}
											</button>
											{!NUBE && (
												<button
													type="button"
													onClick={() => quitarAdmin(a)}
													title="Eliminar cuenta"
													className="flex h-10 w-10 items-center justify-center rounded-full border border-rojo-700/15 text-rojo-700 transition-[background-color] hover:bg-rojo-100 active:scale-[0.95]"
												>
													<Trash2 size={17} aria-hidden="true" />
												</button>
											)}
										</span>
									)}
								</div>

								{resetId === a.id && !NUBE && (
									<div className="mt-3 flex gap-2 border-t border-rojo-700/10 pt-3">
										<input
											type="password"
											value={resetClave}
											onChange={(e) => setResetClave(e.target.value)}
											placeholder={`Nueva clave para ${a.nombre} (mín. 4)`}
											aria-label={`Nueva clave para ${a.nombre}`}
											className={`${inputCls} flex-1`}
										/>
										<button
											type="button"
											disabled={resetClave.length < 4}
											onClick={() => guardarReset(a.id)}
											className="shrink-0 rounded-xl bg-rojo-600 px-5 text-sm font-semibold text-white transition-[transform,background-color] hover:bg-rojo-500 active:scale-[0.97] disabled:opacity-50"
										>
											Guardar
										</button>
									</div>
								)}
							</li>
						))}
					</ul>
				</motion.div>
			)}

			{tab === 'cuenta' && (
				<motion.div
					key="tab-cuenta"
					initial={{ opacity: 0, y: 14 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -8 }}
					transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
					className="mt-6 rounded-2xl border border-rojo-700/10 bg-white p-6"
				>
					<p className="flex items-center gap-2 text-sm font-semibold text-rojo-700">
						<KeyRound size={17} aria-hidden="true" />
						Mi clave de acceso
					</p>
					<p className="mt-1 text-sm text-rojo-700/60">
						Sesión iniciada como {session.nombre} (@{session.usuario}).
					</p>
					<div className="mt-3 flex gap-2">
						<input
							type="password"
							value={miClave}
							onChange={(e) => {
								setMiClave(e.target.value);
								setMiClaveOk(false);
							}}
							placeholder="Nueva clave (mín. 4)"
							aria-label="Nueva clave"
							className={`${inputCls} flex-1`}
						/>
						<button
							type="button"
							disabled={miClave.length < 4}
							onClick={async () => {
								const ok = NUBE
									? await cambiarMiClaveNube(miClave)
									: await cambiarClaveAdmin(session.id, miClave);
								setMiClaveOk(ok);
								if (ok) setMiClave('');
							}}
							className="shrink-0 rounded-xl bg-rojo-600 px-5 text-sm font-semibold text-white transition-[transform,background-color] hover:bg-rojo-500 active:scale-[0.97] disabled:opacity-50"
						>
							Guardar
						</button>
					</div>
					{miClaveOk && (
						<p className="mt-2 text-sm font-medium text-rojo-600">Clave actualizada.</p>
					)}
				</motion.div>
			)}
			</AnimatePresence>
		</motion.div>
		</MotionConfig>
	);
}
