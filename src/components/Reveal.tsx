import { useEffect, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';

interface RevealProps {
	children: ReactNode;
	delay?: number;
	className?: string;
	y?: number;
}

/**
 * Aparición al entrar en viewport con mejora progresiva:
 * sin JS el contenido siempre es visible (el CSS solo oculta
 * bajo `html.js`), así que nunca puede quedar invisible.
 */
export default function Reveal({ children, delay = 0, className = '', y = 24 }: RevealProps) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (typeof IntersectionObserver === 'undefined') {
			el.classList.add('in');
			return;
		}
		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('in');
						io.unobserve(entry.target);
					}
				});
			},
			{ rootMargin: '0px', threshold: 0.1 },
		);
		io.observe(el);
		return () => io.disconnect();
	}, []);

	const style = { '--rv-delay': `${delay}ms`, '--rv-y': `${y}px` } as CSSProperties;

	return (
		<div ref={ref} style={style} className={`rv ${className}`}>
			{children}
		</div>
	);
}
