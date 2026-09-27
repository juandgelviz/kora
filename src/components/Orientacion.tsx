import { MessageCircleQuestion, Compass, Route, Scale, Info } from 'lucide-react';
import Reveal from './Reveal';
import SectionHead from './SectionHead';

const PASOS = [
	{
		icon: MessageCircleQuestion,
		step: 'Paso 1',
		title: 'Cuéntanos tu caso',
		text: 'Describe tu situación en el formulario con tus palabras. Entre más concreta sea la información, mejor podremos ayudarte.',
	},
	{
		icon: Compass,
		step: 'Paso 2',
		title: 'Recibe orientación',
		text: 'Te explicamos qué derechos pueden estar en juego y cuáles son los pasos a seguir según tu caso particular.',
	},
	{
		icon: Route,
		step: 'Paso 3',
		title: 'Actúa con respaldo',
		text: 'Te mostramos las rutas institucionales disponibles: inspección del trabajo, conciliación, reclamaciones y más.',
	},
];

export default function Orientacion() {
	return (
		<section id="orientacion" className="scroll-mt-20 bg-rojo-700">
			<div className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-10">
				<SectionHead
					dark
					title="Orientación paso a paso, sin vueltas"
					description="No necesitas saber de leyes para empezar. Te acompañamos desde la primera pregunta hasta la ruta de acción."
				/>
				<ol className="mt-12 grid gap-5 md:grid-cols-3">
					{PASOS.map((item, index) => (
						<Reveal key={item.title} delay={index * 50}>
							<li className="h-full rounded-2xl border border-white/15 bg-white/5 p-7 backdrop-blur-sm">
								<span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-rojo-100">
									<item.icon size={24} strokeWidth={1.8} aria-hidden="true" />
								</span>
								<p className="mt-5 text-xs font-semibold tracking-[0.2em] text-rojo-200 uppercase">
									{item.step}
								</p>
								<h3 className="mt-2 text-2xl text-white">{item.title}</h3>
								<p className="mt-3 text-[15px] leading-relaxed text-white/75">
									{item.text}
								</p>
							</li>
						</Reveal>
					))}
				</ol>

				<div className="mt-5 grid gap-5 lg:grid-cols-5">
					<Reveal className="lg:col-span-3">
						<div className="flex h-full flex-col gap-4 rounded-2xl bg-white p-7 sm:p-8">
							<p className="flex items-center gap-2 text-sm font-semibold text-rojo-600">
								<Scale size={18} aria-hidden="true" />
								¿Qué es la acción de tutela?
							</p>
							<p className="text-[15px] leading-relaxed text-rojo-700/80">
								Es un mecanismo rápido para proteger tus derechos fundamentales cuando
								están siendo vulnerados o amenazados, por ejemplo frente a un despido
								discriminatorio o la negación de atención en salud. Se presenta por
								escrito ante un juez y debe resolverse en pocos días.
							</p>
						</div>
					</Reveal>
					<Reveal delay={50} className="lg:col-span-2">
						<div className="flex h-full items-start gap-3 rounded-2xl border border-white/20 bg-white/5 p-7">
							<Info size={20} className="mt-0.5 shrink-0 text-rojo-100" aria-hidden="true" />
							<p className="text-sm leading-relaxed text-white/85">
								La información de KORA es orientación general y didáctica.{' '}
								<strong className="font-semibold text-white">
									No reemplaza la asesoría de un abogado
								</strong>{' '}
								ni constituye representación legal.
							</p>
						</div>
					</Reveal>
				</div>
			</div>
		</section>
	);
}
