import { FileText, ExternalLink, Phone } from 'lucide-react';
import Reveal from './Reveal';
import SectionHead from './SectionHead';

const GUIAS = [
	{
		title: 'Guía: me despidieron, ¿ahora qué?',
		desc: 'Liquidación, indemnización y plazos para reclamar paso a paso.',
		meta: 'Guía · 6 min',
	},
	{
		title: 'Guía: horas extra y recargos',
		desc: 'Cómo calcular lo que te deben por trabajo nocturno y festivos.',
		meta: 'Guía · 5 min',
	},
	{
		title: 'Guía: ruta contra el acoso',
		desc: 'Comité de convivencia, queja ante el Ministerio y tutela.',
		meta: 'Guía · 7 min',
	},
	{
		title: 'Guía: verifica tu afiliación',
		desc: 'Cómo comprobar salud, pensión y riesgos laborales en línea.',
		meta: 'Guía · 4 min',
	},
];

const OFICIALES = [
	{
		title: 'Ministerio del Trabajo',
		desc: 'Portal oficial: trámites, inspecciones y denuncias.',
		href: 'https://www.mintrabajo.gov.co/',
	},
	{
		title: 'Servicio Público de Empleo',
		desc: 'Vacantes, orientación ocupacional y rutas de empleabilidad.',
		href: 'https://www.mintrabajo.gov.co/atencion-al-ciudadano/tramites-y-servicios/servicio-publico-del-empleo',
	},
];

export default function Recursos() {
	return (
		<section id="recursos" className="scroll-mt-20 bg-rojo-100">
			<div className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-10">
				<SectionHead
					title="Recursos y rutas oficiales"
					description="Guías sencillas para ampliar lo aprendido y enlaces directos a las entidades que pueden actuar en tu caso."
				/>

				<div className="mt-12 grid gap-5 sm:grid-cols-2">
					{GUIAS.map((guia, index) => (
						<Reveal key={guia.title} delay={(index % 2) * 50}>
							<article className="flex h-full items-start gap-4 rounded-2xl border border-rojo-700/10 bg-white p-6 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_12px_32px_-16px_rgba(46,5,5,0.35)]">
								<span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rojo-200 text-rojo-600">
									<FileText size={22} strokeWidth={1.8} aria-hidden="true" />
								</span>
								<div>
									<h3 className="text-xl leading-snug text-rojo-700">{guia.title}</h3>
									<p className="mt-1.5 text-sm leading-relaxed text-rojo-700/70">{guia.desc}</p>
									<p className="mt-2 text-xs font-semibold tracking-wide text-rojo-500 uppercase">
										{guia.meta}
									</p>
								</div>
							</article>
						</Reveal>
					))}
				</div>

				<div className="mt-5 grid gap-5 lg:grid-cols-3">
					{OFICIALES.map((item, index) => (
						<Reveal key={item.title} delay={index * 50}>
							<a
								href={item.href}
								target="_blank"
								rel="noreferrer"
								className="flex h-full items-start justify-between gap-4 rounded-2xl bg-rojo-600 p-6 text-white transition-[transform,background-color] duration-200 ease-out hover:-translate-y-1 hover:bg-rojo-500"
							>
								<span>
									<span className="font-display text-xl">{item.title}</span>
									<span className="mt-1.5 block text-sm leading-relaxed text-white/75">
										{item.desc}
									</span>
								</span>
								<ExternalLink size={20} className="mt-1 shrink-0" aria-hidden="true" />
							</a>
						</Reveal>
					))}
					<Reveal delay={100}>
						<a
							href="tel:018000112518"
							className="flex h-full items-start gap-4 rounded-2xl border border-rojo-700/10 bg-white p-6 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_12px_32px_-16px_rgba(46,5,5,0.35)]"
						>
							<span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rojo-200 text-rojo-600">
								<Phone size={22} strokeWidth={1.8} aria-hidden="true" />
							</span>
							<span>
								<span className="font-display block text-xl text-rojo-700">
									Línea gratuita nacional
								</span>
								<span className="mt-1 block text-lg font-semibold text-rojo-600">
									01-8000-112518
								</span>
								<span className="mt-1 block text-sm text-rojo-700/60">
									Ministerio del Trabajo · Lun–Vie
								</span>
							</span>
						</a>
					</Reveal>
				</div>
			</div>
		</section>
	);
}
