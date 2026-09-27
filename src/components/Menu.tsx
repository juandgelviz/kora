import { useEffect, useState } from 'react';

const LINKS = [
	{ label: 'Inicio', href: '#inicio' },
	{ label: 'Derechos', href: '#derechos' },
	{ label: 'Historias', href: '#historias' },
	{ label: 'Orientación', href: '#orientacion' },
	{ label: 'Recursos', href: '#recursos' },
	{ label: 'Contacto', href: '#contacto' },
];

export default function Menu() {
	const [open, setOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 8);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	useEffect(() => {
		document.body.style.overflow = open ? 'hidden' : '';
		const onKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setOpen(false);
		};
		window.addEventListener('keydown', onKey);
		return () => {
			document.body.style.overflow = '';
			window.removeEventListener('keydown', onKey);
		};
	}, [open ]);

	return (
		<>
			<header
				className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-200 ${
					scrolled || open
						? 'border-b border-rojo-700/10 bg-rojo-100/80 backdrop-blur-xl'
						: 'border-b border-transparent bg-transparent'
				}`}
			>
				<div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 sm:px-10 md:h-20">
					<a
						href="#inicio"
						className="group flex items-center gap-3"
						aria-label="Kora — inicio"
					>
						<img
							src="/logo.png"
							alt=""
							width={36}
							height={36}
							className="h-9 w-9 rounded-full object-cover transition-transform duration-200 ease-out group-hover:scale-105"
						/>
						<span className="font-display text-2xl leading-none tracking-tight text-rojo-700">
							Kora
						</span>
					</a>

					<nav className="hidden items-center gap-6 md:flex" aria-label="Principal">
						{LINKS.map((link) => (
							<a
								key={link.href}
								href={link.href}
								className="nav-link py-2 text-sm font-medium text-rojo-700/60 hover:text-rojo-700"
							>
								{link.label}
							</a>
						))}
						<a
							href="#contacto"
							className="inline-flex items-center rounded-full bg-rojo-600 px-5 py-2.5 text-sm font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-rojo-500 active:scale-[0.97]"
						>
							Comenzar
						</a>
					</nav>

					<button
						type="button"
						className="flex h-11 w-11 items-center justify-center rounded-full text-rojo-700 transition-[background-color] duration-150 ease-out hover:bg-rojo-500/5 active:scale-[0.97] md:hidden"
						aria-expanded={open}
						aria-controls="menu-movil"
						aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
						onClick={() => setOpen((value) => !value)}
					>
						<span className="flex flex-col items-center gap-[6px]" aria-hidden="true">
							<span
								className={`block h-[2px] w-6 bg-current transition-transform duration-[250ms] ease-[var(--ease-out)] ${
									open ? 'translate-y-[4px] rotate-45' : ''
								}`}
							/>
							<span
								className={`block h-[2px] w-6 bg-current transition-transform duration-[250ms] ease-[var(--ease-out)] ${
									open ? '-translate-y-[4px] -rotate-45' : ''
								}`}
							/>
						</span>
					</button>
				</div>
			</header>

			<div
				id="menu-movil"
				className="mobile-menu fixed inset-0 z-40 bg-rojo-100/95 backdrop-blur-2xl md:hidden"
				data-open={open}
				aria-hidden={!open}
			>
				<nav
					className="flex h-full flex-col justify-center gap-2 px-8"
					aria-label="Móvil"
				>
					{LINKS.map((link, index) => (
						<a
							key={link.href}
							href={link.href}
							tabIndex={open ? 0 : -1}
							className="mobile-menu-item font-display border-b border-rojo-700/10 py-4 text-5xl leading-none text-rojo-700 transition-[color] duration-150 ease-out hover:text-rojo-700/70"
							style={{ transitionDelay: open ? `${index * 50}ms` : '0ms' }}
							onClick={() => setOpen(false)}
						>
							{link.label}
						</a>
					))}
					<a
						href="#contacto"
						tabIndex={open ? 0 : -1}
						className="mobile-menu-item mt-8 inline-flex items-center justify-center rounded-full bg-rojo-600 px-7 py-4 text-base font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-rojo-500 active:scale-[0.97]"
						style={{ transitionDelay: open ? `${LINKS.length * 50}ms` : '0ms' }}
						onClick={() => setOpen(false)}
					>
						Comenzar
					</a>
				</nav>
			</div>
		</>
	);
}
