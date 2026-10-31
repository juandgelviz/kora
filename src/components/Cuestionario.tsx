import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
	CheckCircle2,
	XCircle,
	RotateCcw,
	ClipboardCheck,
	ArrowDown,
} from 'lucide-react';
import Reveal from './Reveal';
import SectionHead from './SectionHead';

const LETRAS = ['A', 'B', 'C', 'D'] as const;

/* Misma curva que el token --ease-out de global.css */
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

interface OpcionCuestionario {
	texto: string;
	correcta: boolean;
	/** Por qué NO es la correcta (solo en opciones incorrectas) */
	whyNot?: string;
}

interface PreguntaCuestionario {
	pregunta: string;
	opciones: OpcionCuestionario[];
	/** Por qué la correcta ES correcta */
	whyCorrecta: string;
}

const PREGUNTAS: PreguntaCuestionario[] = [
	{
		pregunta: '¿Cuánto debería ganar una persona para vivir dignamente?',
		opciones: [
			{
				texto:
					'Lo suficiente para cubrir alimentación, vivienda, salud, transporte y otras necesidades básicas.',
				correcta: true,
			},
			{
				texto: 'Cualquier salario alcanza si se sabe administrar.',
				correcta: false,
				whyNot:
					'Con un ingreso demasiado bajo no alcanza por más presupuesto que se haga: la austeridad no reemplaza un salario insuficiente.',
			},
			{
				texto:
					'El salario que la empresa decida pagar, aunque sea bajo, siempre es válido.',
				correcta: false,
				whyNot:
					'El salario es un derecho protegido por la ley: pagar cualquier cifra viola el principio de remuneración digna.',
			},
			{
				texto:
					'Una vida digna es un lujo: con techo y comida del día a día basta.',
				correcta: false,
				whyNot:
					'Una vida digna incluye salud, educación, transporte y descanso; reducirla a sobrevivir va contra los derechos fundamentales.',
			},
		],
		whyCorrecta:
			'Vivir dignamente es poder cubrir las necesidades básicas sin sacrificar salud, educación ni descanso. Un ingreso que no alcanza para eso no cumple ese estándar, por más que se administre con cuidado.',
	},
	{
		pregunta:
			'¿Por qué hay personas que trabajan todos los días y siguen siendo pobres?',
		opciones: [
			{
				texto:
					'Por los bajos salarios, la informalidad, la desigualdad y el alto costo de vida.',
				correcta: true,
			},
			{
				texto: 'Porque no se esfuerzan lo suficiente o gastan mal su dinero.',
				correcta: false,
				whyNot:
					'Trabajar todos los días sin salir de la pobreza no habla de falta de esfuerzo: habla de ingresos que no alcanzan por razones estructurales.',
			},
			{
				texto:
					'Porque prefieren la informalidad antes que un empleo formal.',
				correcta: false,
				whyNot:
					'La informalidad suele ser falta de opciones, no de preferencia: muchas personas no consiguen un empleo formal que les pague lo mismo.',
			},
			{
				texto:
					'Porque las empresas siempre pagan lo justo según el esfuerzo de cada trabajador.',
				correcta: false,
				whyNot:
					'En la práctica hay salarios que no reflejan el esfuerzo ni la productividad; por eso el trabajo pleno puede convivir con la pobreza.',
			},
		],
		whyCorrecta:
			'Cuando los salarios son bajos o informales y el costo de vida no se detiene, el esfuerzo diario puede terminar en pobreza. Es un problema del sistema, no de la persona.',
	},
	{
		pregunta:
			'¿Qué pasaría si mañana todos los colombianos tuvieran un empleo digno?',
		opciones: [
			{
				texto:
					'Disminuiría la pobreza, mejoraría la calidad de vida y crecería la economía.',
				correcta: true,
			},
			{
				texto: 'No cambiaría nada importante en el país.',
				correcta: false,
				whyNot:
					'Se notaría de inmediato: más familias con ingresos estables, más consumo local y menos pobreza.',
			},
			{
				texto:
					'Subiría la pobreza, porque los salarios dignos encarecerían todo.',
				correcta: false,
				whyNot:
					'La evidencia muestra lo contrario: salarios suficientes elevan la demanda local y la productividad, no la pobreza.',
			},
			{
				texto: 'Solo favorecería a las grandes empresas.',
				correcta: false,
				whyNot:
					'El beneficio primero es de los hogares: su economía mejora sin importar el tamaño del empleador.',
			},
		],
		whyCorrecta:
			'Con ingresos dignos, las familias salen de la pobreza, mejoran su bienestar y el consumo local se activa: el empleo digno es la base de una economía más sólida y menos desigual.',
	},
];

const respCorrecta = (p: PreguntaCuestionario) =>
	p.opciones.findIndex((o) => o.correcta);

export default function Cuestionario() {
	const [respuestas, setRespuestas] = useState<(number | null)[]>(
		PREGUNTAS.map(() => null),
	);
	const reduce = useReducedMotion();

	const respondidas = respuestas.filter((r) => r !== null).length;
	const correctas = respuestas.filter(
		(r, i) => r !== null && r === respCorrecta(PREGUNTAS[i]),
	).length;

	const responder = (qi: number, oi: number) => {
		setRespuestas((prev) => prev.map((r, i) => (i === qi ? oi : r)));
	};

	const reiniciar = (qi: number) => {
		setRespuestas((prev) => prev.map((r, i) => (i === qi ? null : r)));
	};

	return (
		<section id="cuestionario" className="scroll-mt-20 bg-white">
			<div className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-10">
				<SectionHead
					title="Ponte a prueba"
					description="Tres preguntas para derribar mitos sobre el trabajo y el salario. Elige una opción y te contamos si estás en lo cierto, y por qué."
				/>

				<div className="mt-12 flex flex-col gap-6">
					{PREGUNTAS.map((p, qi) => {
						const responded = respuestas[qi] !== null;
						const seleccionada = respuestas[qi];
						const correcta = respCorrecta(p);

						return (
							<Reveal key={p.pregunta} delay={qi * 60}>
								<article className="rounded-3xl border border-rojo-700/10 bg-rojo-100 p-6 sm:p-8">
									<div className="flex items-center justify-between gap-4">
										<p className="text-xs font-semibold tracking-[0.22em] text-rojo-500 uppercase">
											Pregunta {qi + 1} de {PREGUNTAS.length}
										</p>
										{responded ? (
											<motion.button
												type="button"
												onClick={() => reiniciar(qi)}
												whileHover={reduce ? undefined : { y: -1 }}
												whileTap={reduce ? undefined : { scale: 0.96 }}
												className="inline-flex items-center gap-1.5 rounded-full border border-rojo-700/15 px-3 py-1.5 text-xs font-semibold text-rojo-700/60 transition-[background-color,color] hover:bg-rojo-100 hover:text-rojo-700"
											>
												<RotateCcw size={14} aria-hidden="true" />
												Intentar de nuevo
											</motion.button>
										) : null}
									</div>

									<h3 className="mt-3 font-display text-2xl leading-snug text-rojo-700 sm:text-3xl">
										{p.pregunta}
									</h3>

									<ul className="mt-6 flex flex-col gap-3">
										{p.opciones.map((o, oi) => {
											const esCorrecta = oi === correcta;
											const esSeleccionada = seleccionada === oi;

											const estilo = !responded
												? 'border-rojo-700/10 bg-white hover:border-rojo-700/30'
												: esSeleccionada && esCorrecta
													? 'border-rojo-600 bg-white'
													: esSeleccionada
														? 'border-dashed border-rojo-400 bg-rojo-100'
														: esCorrecta
															? 'border-rojo-600/60 bg-white'
															: 'border-rojo-700/5 bg-white opacity-60';

											const icono = responded
												? esCorrecta
													? 'check'
													: esSeleccionada
														? 'x'
														: null
												: null;

											return (
												<li key={o.texto}>
													<motion.button
														type="button"
														onClick={() => responder(qi, oi)}
														aria-pressed={esSeleccionada}
														whileHover={
															!responded && !reduce ? { y: -2 } : undefined
														}
														whileTap={
															!responded && !reduce ? { scale: 0.985 } : undefined
														}
														className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-[border-color,background-color,opacity,box-shadow] duration-200 ease-out ${estilo}`}
													>
														<span
															className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors duration-200 ${
																responded && esCorrecta
																	? 'border-rojo-600 bg-rojo-600 text-white'
																	: 'border-rojo-700/20 bg-white text-rojo-600'
															}`}
															aria-hidden="true"
														>
															<AnimatePresence
																mode="wait"
																initial={false}
															>
																<motion.span
																	key={
																		icono ?? `letra-${oi}`
																	}
																	initial={{ opacity: 0, scale: 0.5 }}
																	animate={{ opacity: 1, scale: 1 }}
																	exit={{ opacity: 0, scale: 0.5 }}
																	transition={{
																		duration: reduce ? 0.12 : 0.18,
																		ease: EASE_OUT,
																	}}
																	className="inline-flex items-center justify-center"
																>
																	{icono === 'check' ? (
																		<CheckCircle2 size={16} />
																	) : icono === 'x' ? (
																		<XCircle size={16} />
																	) : (
																		LETRAS[oi]
																	)}
																</motion.span>
															</AnimatePresence>
														</span>
														<span
															className={`flex-1 text-[15px] leading-relaxed transition-colors duration-200 ${
																esSeleccionada || responded
																	? 'font-semibold text-rojo-700'
																	: 'text-rojo-700/85'
															}`}
														>
															{o.texto}
														</span>
													</motion.button>
												</li>
											);
										})}
									</ul>

									{/* Feedback: aparece creciendo en altura; al cambiar
									    de respuesta hace cruce suave por su key */}
									<AnimatePresence initial={false}>
										{responded ? (
											<motion.div
												key={seleccionada === correcta ? 'ok' : seleccionada ?? 0}
												initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
												animate={reduce ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
												exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
												transition={{
													duration: reduce ? 0.15 : 0.4,
													ease: EASE_OUT,
												}}
												style={{ overflow: 'hidden' }}
											>
												{seleccionada === correcta ? (
													<div
														aria-live="polite"
														className="mt-6 flex gap-4 rounded-2xl bg-rojo-700 p-5 text-white sm:p-6"
													>
														<CheckCircle2
															size={24}
															className="mt-0.5 shrink-0"
															aria-hidden="true"
														/>
														<div>
															<p className="font-semibold">
																¡Muy bien! Esa es la respuesta.
															</p>
															<p className="mt-1 text-sm leading-relaxed text-white/80">
																{p.whyCorrecta}
															</p>
														</div>
													</div>
												) : (
													<div
														aria-live="polite"
														className="mt-6 flex gap-4 rounded-2xl border-2 border-dashed border-rojo-400 bg-rojo-100 p-5 sm:p-6"
													>
														<XCircle
															size={24}
															className="mt-0.5 shrink-0 text-rojo-500"
															aria-hidden="true"
														/>
														<div>
															<p className="font-semibold text-rojo-700">
																Esa no era la correcta (elegiste la{' '}
																{LETRAS[seleccionada ?? 0]}). La respuesta
																correcta es la {LETRAS[correcta]}.
															</p>
															{p.opciones[seleccionada ?? 0].whyNot ? (
																<p className="mt-2 text-sm leading-relaxed text-rojo-700/75">
																	{p.opciones[seleccionada ?? 0].whyNot}
																</p>
															) : null}
															<p className="mt-2 text-sm leading-relaxed text-rojo-700/85">
																{p.whyCorrecta}
															</p>
														</div>
													</div>
												)}
											</motion.div>
										) : null}
									</AnimatePresence>
								</article>
							</Reveal>
						);
					})}
				</div>

				{/* Resultado final: pop spring al completar las 3 */}
				<AnimatePresence>
					{respondidas === PREGUNTAS.length ? (
						<Reveal>
							<motion.div
								initial={
									reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 16 }
								}
								animate={
									reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }
								}
								transition={
									reduce
										? { duration: 0.15 }
										: {
												type: 'spring',
												stiffness: 240,
												damping: 22,
											}
								}
								className="mt-10 flex flex-col items-center gap-5 rounded-3xl bg-rojo-600 p-8 text-center text-white sm:p-10"
							>
								<span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
									<ClipboardCheck size={24} aria-hidden="true" />
								</span>
								<p className="font-display text-3xl text-white sm:text-4xl">
									{correctas} de {PREGUNTAS.length} respuestas correctas
								</p>
								<p className="max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
									{correctas === PREGUNTAS.length
										? 'Dominas lo esencial del trabajo digno. Los datos reales del país confirman por qué importa tanto esto.'
										: 'Cada respuesta aclarada es un mito menos. Mira los datos reales del país y sigue aprendiendo tus derechos.'}
								</p>
								<motion.a
									href="#informacion"
									whileHover={reduce ? undefined : { y: -2 }}
									whileTap={reduce ? undefined : { scale: 0.97 }}
									className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-rojo-700 transition-colors duration-150 hover:bg-rojo-100"
								>
									Ver los datos del DANE
									<ArrowDown size={16} aria-hidden="true" />
								</motion.a>
							</motion.div>
						</Reveal>
					) : null}
				</AnimatePresence>
			</div>
		</section>
	);
}
