import {
	Wallet,
	Clock,
	ShieldCheck,
	Scale,
	HeartHandshake,
	CalendarCheck,
} from 'lucide-react';
import Reveal from './Reveal';
import SectionHead from './SectionHead';

const DERECHOS = [
	{
		icon: Wallet,
		title: 'Salario justo',
		text: 'Pago completo y puntual de tu salario, auxilio de transporte y recargos por horas extra, trabajo nocturno y festivos.',
		span: 'lg:col-span-2',
		wide: true,
	},
	{
		icon: Clock,
		title: 'Jornada y descansos',
		text: 'Jornada máxima legal, pausas durante el día y un día de descanso semanal.',
		span: '',
		wide: false,
	},
	{
		icon: ShieldCheck,
		title: 'Seguridad social',
		text: 'Afiliación a salud, pensión y riesgos laborales desde el primer día.',
		span: '',
		wide: false,
	},
	{
		icon: Scale,
		title: 'Estabilidad y despido',
		text: 'Conoce cuándo un despido es injusto, qué indemnización te corresponde y cómo reclamar tus derechos ante las instancias laborales.',
		span: 'lg:col-span-2',
		wide: true,
	},
	{
		icon: HeartHandshake,
		title: 'Trato digno',
		text: 'Ambiente libre de acoso laboral, sexual y discriminación.',
		span: '',
		wide: false,
	},
	{
		icon: CalendarCheck,
		title: 'Primas y cesantías',
		text: 'Prima de servicios, cesantías con intereses y dotación según la ley.',
		span: '',
		wide: false,
	},
];

export default function Derechos() {
	return (
		<section id="derechos" className="scroll-mt-20 bg-white">
			<div className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-10">
				<SectionHead
					title="Tus derechos, en lenguaje claro"
					description="Sin tecnicismos: esto es lo mínimo que la ley garantiza a toda persona trabajadora. Si algo de esto te está pasando, podemos orientarte."
				/>
				<div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
					{DERECHOS.map((item, index) => (
						<Reveal key={item.title} delay={(index % 4) * 40} className={item.span}>
							<article
								className={`h-full rounded-2xl border border-rojo-700/10 bg-rojo-100 p-7 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_12px_32px_-16px_rgba(46,5,5,0.35)] ${
									item.wide ? 'sm:flex sm:items-start sm:gap-6' : ''
								}`}
							>
								<span
									className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-rojo-600 text-white ${
										item.wide ? 'h-14 w-14' : 'h-12 w-12'
									}`}
								>
									<item.icon size={item.wide ? 28 : 24} strokeWidth={1.8} aria-hidden="true" />
								</span>
								<span>
									<h3 className={`mt-5 text-rojo-700 ${item.wide ? 'text-3xl sm:mt-1' : 'text-2xl'}`}>
										{item.title}
									</h3>
									<p
										className={`mt-3 leading-relaxed text-rojo-700/70 ${
											item.wide ? 'max-w-md text-base' : 'text-[15px]'
										}`}
									>
										{item.text}
									</p>
								</span>
							</article>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}
