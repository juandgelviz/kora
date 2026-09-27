import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Reveal from './Reveal';
import SectionHead from './SectionHead';

const HISTORIAS = [
	{
		quote:
			'Me despidieron estando en embarazo y pensé que no tenía opción. Aquí entendí qué reclamar y hoy tengo mi reintegro en trámite.',
		name: 'Marta G.',
		role: 'Operaria textil · Bogotá',
		tag: 'Despido injusto',
	},
	{
		quote:
			'Trabajaba 10 horas sin pago de extras “porque así es el sector”. Con la orientación supe calcular lo que me debían y lo reclamé.',
		name: 'Jair P.',
		role: 'Repartidor · Medellín',
		tag: 'Horas extra',
	},
	{
		quote:
			'Sufrí acoso de mi supervisor y no sabía a dónde acudir. Me explicaron la ruta, incluida la tutela, y por fin me escucharon.',
		name: 'Lucía F.',
		role: 'Auxiliar contable · Cali',
		tag: 'Acoso laboral',
	},
];

const REGLAS = [
	'Nombres anonimizados: tu identidad está protegida.',
	'Sin datos personales ni nombres de empresas en público.',
	'Lenguaje respetuoso: cero tolerancia con el acoso.',
];

/* Carrusel base de prueba: reemplázalo por el definitivo cuando lo tengas. */
export default function Historias() {
	const [[index, direction], setSlide] = useState<[number, number]>([0, 0]);

	const go = (dir: 1 | -1) =>
		setSlide([(index + dir + HISTORIAS.length) % HISTORIAS.length, dir]);

	const item = HISTORIAS[index];

	return (
		<section id="historias" className="scroll-mt-20 bg-rojo-100">
			<div className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-10">
				<SectionHead
					align="center"
					kicker="Comunidad"
					title="Historias que inspiran a actuar"
					description="Experiencias reales de personas que vivieron vulneraciones y encontraron una ruta. Compartir también es una forma de ayudar."
				/>

				<Reveal className="mx-auto mt-12 max-w-3xl">
					<div className="relative overflow-hidden rounded-2xl border border-rojo-700/10 bg-white p-8 sm:p-10">
						<AnimatePresence mode="wait" custom={direction}>
							<motion.figure
								key={index}
								initial={{ opacity: 0, x: 48 * direction }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -48 * direction }}
								transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
							>
								<span className="inline-flex w-fit rounded-full bg-rojo-200 px-3 py-1 text-xs font-semibold text-rojo-600">
									{item.tag}
								</span>
								<blockquote className="mt-4 min-h-24 text-lg leading-relaxed text-pretty text-rojo-700/85">
									“{item.quote}”
								</blockquote>
								<figcaption className="mt-6 border-t border-rojo-700/10 pt-4">
									<p className="text-sm font-semibold text-rojo-700">{item.name}</p>
									<p className="text-sm text-rojo-700/60">{item.role}</p>
								</figcaption>
							</motion.figure>
						</AnimatePresence>

						<div className="mt-8 flex items-center justify-between">
							<div className="flex items-center gap-2" role="tablist" aria-label="Historias">
								{HISTORIAS.map((h, i) => (
									<button
										key={h.name}
										type="button"
										role="tab"
										aria-selected={i === index}
										aria-label={`Historia ${i + 1}: ${h.tag}`}
										onClick={() => setSlide([i, i > index ? 1 : -1])}
										className={`h-2 rounded-full transition-[width,background-color] duration-200 ease-out ${
											i === index ? 'w-8 bg-rojo-600' : 'w-2 bg-rojo-700/20 hover:bg-rojo-700/40'
										}`}
									/>
								))}
							</div>
							<div className="flex items-center gap-2">
								<span className="mr-1 text-sm font-medium text-rojo-700/60 tabular-nums">
									{index + 1} / {HISTORIAS.length}
								</span>
								<button
									type="button"
									onClick={() => go(-1)}
									aria-label="Historia anterior"
									className="flex h-11 w-11 items-center justify-center rounded-full border border-rojo-700/15 text-rojo-700 transition-[transform,background-color] duration-150 ease-out hover:bg-rojo-100 active:scale-[0.95]"
								>
									<ChevronLeft size={20} aria-hidden="true" />
								</button>
								<button
									type="button"
									onClick={() => go(1)}
									aria-label="Historia siguiente"
									className="flex h-11 w-11 items-center justify-center rounded-full bg-rojo-600 text-white transition-[transform,background-color] duration-150 ease-out hover:bg-rojo-500 active:scale-[0.95]"
								>
									<ChevronRight size={20} aria-hidden="true" />
								</button>
							</div>
						</div>
					</div>
				</Reveal>

				<Reveal delay={80} className="mt-10">
					<div className="flex flex-col items-start gap-6 rounded-2xl bg-rojo-200/60 p-7 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
						<div>
							<p className="flex items-center gap-2 text-sm font-semibold text-rojo-600">
								<ShieldCheck size={18} aria-hidden="true" />
								Reglas de convivencia y privacidad
							</p>
							<ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-rojo-700/75">
								{REGLAS.map((regla) => (
									<li key={regla}>· {regla}</li>
								))}
							</ul>
							<p className="mt-3 text-xs text-rojo-700/50">
								Historias ilustrativas del tipo de casos que acompañamos.
							</p>
						</div>
						<a
							href="#contacto"
							className="inline-flex shrink-0 items-center gap-2 rounded-full bg-rojo-600 px-6 py-3 text-sm font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-rojo-500 active:scale-[0.97]"
						>
							Comparte tu caso
							<ArrowRight size={16} aria-hidden="true" />
						</a>
					</div>
				</Reveal>
			</div>
		</section>
	);
}
