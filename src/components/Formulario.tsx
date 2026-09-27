import { useState } from 'react';
import type { FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, CircleCheck, Lock } from 'lucide-react';
import Reveal from './Reveal';
import SectionHead from './SectionHead';
import { crearConsulta } from '../lib/consultas';
import { crearNube, esNube } from '../lib/nube';

const TEMAS = [
	'Salario y pagos',
	'Despido o renuncia',
	'Acoso laboral',
	'Seguridad social',
	'Jornada y descansos',
	'Otro tema',
];

const inputCls =
	'w-full rounded-xl border border-rojo-700/15 bg-white px-4 py-3 text-[15px] text-rojo-700 placeholder:text-rojo-700/40 transition-[border-color,box-shadow] duration-150 ease-out outline-none focus:border-rojo-500 focus:ring-2 focus:ring-rojo-500/25';

export default function Formulario() {
	const [sent, setSent] = useState(false);
	const [sending, setSending] = useState(false);
	const [error, setError] = useState('');

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (sending) return;
		const data = new FormData(event.currentTarget);
		const input = {
			nombre: String(data.get('nombre') || ''),
			correo: String(data.get('correo') || ''),
			tema: String(data.get('tema') || 'Otro tema'),
			mensaje: String(data.get('mensaje') || ''),
		};
		setSending(true);
		setError('');
		const listo = () => {
			setSending(false);
			setSent(true);
		};
		if (esNube()) {
			crearNube(input).then((ok) => {
				if (ok) {
					window.setTimeout(listo, 400);
				} else {
					setSending(false);
					setError('No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.');
				}
			});
		} else {
			crearConsulta(input);
			window.setTimeout(listo, 700);
		}
	};

	return (
		<section id="contacto" className="scroll-mt-20 bg-white">
			<div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-24 sm:px-10 lg:grid-cols-2 lg:items-start">
				<div>
					<SectionHead
						title="Pregunta sin miedo, te leemos"
						description="Describe tu situación y el equipo de orientación la revisará. Respondemos en orden de llegada; los casos urgentes tienen prioridad."
					/>
					<Reveal delay={60}>
						<p className="mt-6 flex items-start gap-2 rounded-2xl border border-rojo-700/10 bg-rojo-100 p-5 text-sm leading-relaxed text-rojo-700/75">
							<Lock size={18} className="mt-0.5 shrink-0 text-rojo-600" aria-hidden="true" />
							Tus datos están protegidos: solo se usan para responder tu consulta y
							nunca se publican sin tu autorización expresa.
						</p>
					</Reveal>
				</div>

				<Reveal delay={80}>
					<div className="rounded-2xl border border-rojo-700/10 bg-rojo-100 p-7 shadow-[0_24px_48px_-32px_rgba(46,5,5,0.4)] sm:p-8">
						<AnimatePresence mode="wait">
							{sent ? (
								<motion.div
									key="ok"
									initial={{ opacity: 0, scale: 0.96 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
									className="flex min-h-[24rem] flex-col items-center justify-center text-center"
								>
									<span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-rojo-200 text-rojo-600">
										<CircleCheck size={32} aria-hidden="true" />
									</span>
									<h3 className="mt-5 text-3xl text-rojo-700">¡Mensaje recibido!</h3>
									<p className="mt-3 max-w-sm text-[15px] leading-relaxed text-rojo-700/70">
										Gracias por confiar en KORA. Revisaremos tu caso y te
										contactaremos muy pronto al correo que indicaste.
									</p>
									<button
										type="button"
										onClick={() => setSent(false)}
										className="mt-6 text-sm font-semibold text-rojo-600 underline-offset-4 hover:underline"
									>
										Enviar otra consulta
									</button>
								</motion.div>
							) : (
								<motion.form
									key="form"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0, scale: 0.98 }}
									transition={{ duration: 0.25 }}
									onSubmit={onSubmit}
									className="flex flex-col gap-4"
								>
									<div className="grid gap-4 sm:grid-cols-2">
										<label className="flex flex-col gap-1.5 text-sm font-medium text-rojo-700">
											Nombre
											<input required name="nombre" placeholder="¿Cómo te llamas?" className={inputCls} />
										</label>
										<label className="flex flex-col gap-1.5 text-sm font-medium text-rojo-700">
											Correo
											<input
												required
												type="email"
												name="correo"
												placeholder="tucorreo@ejemplo.com"
												className={inputCls}
											/>
										</label>
									</div>
									<label className="flex flex-col gap-1.5 text-sm font-medium text-rojo-700">
										Tema de tu consulta
										<select name="tema" defaultValue={TEMAS[0]} className={inputCls}>
											{TEMAS.map((tema) => (
												<option key={tema}>{tema}</option>
											))}
										</select>
									</label>
									<label className="flex flex-col gap-1.5 text-sm font-medium text-rojo-700">
										Describe tu situación
										<textarea
											required
											name="mensaje"
											rows={5}
											placeholder="Cuéntanos qué pasó, cuándo y dónde trabajas…"
											className={`${inputCls} resize-y`}
										/>
									</label>
									<label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-rojo-700/75">
										<input
											required
											type="checkbox"
											name="privacidad"
											className="mt-1 h-4 w-4 shrink-0 accent-rojo-600"
										/>
										Acepto el tratamiento de mis datos para responder esta consulta y
										entiendo que no se publicará nada sin mi autorización.
									</label>
									{error && (
										<p role="alert" className="text-sm font-medium text-rojo-600">
											{error}
										</p>
									)}
									<button
										type="submit"
										disabled={sending}
										className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-rojo-600 px-7 py-3.5 text-sm font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-rojo-500 active:scale-[0.98] disabled:cursor-wait disabled:opacity-80"
									>
										{sending ? (
											<>
												<span className="spinner" aria-hidden="true" />
												Enviando…
											</>
										) : (
											<>
												Enviar consulta
												<Send size={16} aria-hidden="true" />
											</>
										)}
									</button>
								</motion.form>
							)}
						</AnimatePresence>
					</div>
				</Reveal>
			</div>
		</section>
	);
}
