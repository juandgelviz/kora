import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, MessageCircleQuestion } from 'lucide-react';
import Reveal from './Reveal';
import SectionHead from './SectionHead';

const PREGUNTAS = [
	{
		q: '¿Me pueden despedir sin justa causa?',
		a: 'Sí, pero no gratis: si te despiden sin una justa causa comprobada, tienes derecho a una indemnización según tu tipo de contrato y antigüedad. Exige siempre la carta de despido por escrito y guarda todos los soportes.',
	},
	{
		q: '¿Qué hago si no me pagan las horas extra?',
		a: 'Primero calcula lo adeudado con tus desprendibles y horarios. Reclámalo por escrito a tu empleador; si no responde, puedes acudir a un inspector del trabajo o al Ministerio. Guarda fotos, chats y planillas como prueba.',
	},
	{
		q: '¿Qué es la acción de tutela y cuándo usarla?',
		a: 'Es un mecanismo rápido ante un juez para proteger derechos fundamentales vulnerados o amenazados, como un despido discriminatorio. Se presenta por escrito y debe resolverse en días. Te orientamos sobre si tu caso aplica.',
	},
	{
		q: 'Estoy embarazada, ¿me pueden despedir?',
		a: 'Tienes una protección especial: despedirte por tu embarazo es discriminatorio. Si ocurre, existen rutas como el reintegro. Cuéntanos tu caso cuanto antes para orientarte sobre los plazos.',
	},
	{
		q: '¿Qué hago si sufro acoso laboral?',
		a: 'Documenta todo con fechas y testigos, usa el comité de convivencia de tu empresa y, si no hay respuesta, escala al Ministerio del Trabajo. Ninguna forma de acoso es parte del trabajo.',
	},
	{
		q: '¿Mi empleador debe afiliarme a seguridad social?',
		a: 'Sí, desde el primer día: salud, pensión y riesgos laborales. Puedes verificar tu estado de afiliación en línea y si encuentras inconsistencias, tienes derecho a reclamar.',
	},
	{
		q: '¿Cuánto tiempo tengo para reclamar?',
		a: 'En general, los derechos laborales prescriben a los 3 años, pero algunos trámites tienen plazos mucho más cortos. Por eso es clave buscar orientación pronto, no dejar pasar el tiempo.',
	},
	{
		q: '¿KORA me representa legalmente?',
		a: 'No. KORA ofrece orientación general y didáctica para que actúes de manera informada. No reemplaza la asesoría de un abogado ni constituye representación legal.',
	},
];

export default function Preguntas() {
	const [open, setOpen] = useState<number | null>(0);

	return (
		<section id="preguntas" className="scroll-mt-20 bg-rojo-100">
			<div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-24 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
				<div className="lg:sticky lg:top-28">
					<SectionHead
						title="Preguntas frecuentes"
						description="Respuestas cortas a las dudas que más recibimos. Si la tuya no está aquí, escríbenos en el formulario."
					/>
					<Reveal delay={100}>
						<a
							href="#contacto"
							className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-rojo-700/10 bg-white p-5 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-20px_rgba(46,5,5,0.4)]"
						>
							<span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rojo-600 text-white">
								<MessageCircleQuestion size={22} aria-hidden="true" />
							</span>
							<span>
								<span className="block text-[15px] font-semibold text-rojo-700">
									¿Otra pregunta?
								</span>
								<span className="block text-sm text-rojo-700/60">
									Te respondemos desde el formulario
								</span>
							</span>
						</a>
					</Reveal>
				</div>

				<div className="flex flex-col gap-3">
					{PREGUNTAS.map((item, i) => {
						const isOpen = open === i;
						return (
							<Reveal key={item.q} delay={Math.min(i, 4) * 40}>
								<div
									className={`overflow-hidden rounded-2xl border bg-white transition-[border-color,box-shadow] duration-200 ease-out ${
										isOpen
											? 'border-rojo-600/30 shadow-[0_12px_32px_-20px_rgba(46,5,5,0.4)]'
											: 'border-rojo-700/10'
									}`}
								>
									<button
										type="button"
										onClick={() => setOpen(isOpen ? null : i)}
										aria-expanded={isOpen}
										aria-controls={`faq-panel-${i}`}
										className="flex w-full items-center gap-4 p-5 text-left sm:p-6"
									>
										<span className="flex-1 text-[15px] font-semibold text-rojo-700 sm:text-base">
											{item.q}
										</span>
										<span
											className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-[transform,background-color,color] duration-250 ease-out ${
												isOpen ? 'rotate-45 bg-rojo-600 text-white' : 'bg-rojo-100 text-rojo-700'
											}`}
										>
											<Plus size={18} aria-hidden="true" />
										</span>
									</button>
									<AnimatePresence initial={false}>
										{isOpen && (
											<motion.div
												key="panel"
												id={`faq-panel-${i}`}
												role="region"
												initial={{ height: 0, opacity: 0 }}
												animate={{ height: 'auto', opacity: 1 }}
												exit={{ height: 0, opacity: 0 }}
												transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
											>
												<p className="px-5 pb-6 text-[15px] leading-relaxed text-rojo-700/75 sm:px-6">
													{item.a}
												</p>
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							</Reveal>
						);
					})}
				</div>
			</div>
		</section>
	);
}
