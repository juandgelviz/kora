import type { ReactNode } from 'react';
import Reveal from './Reveal';

interface SectionHeadProps {
	kicker?: string;
	title: string;
	description?: string;
	align?: 'left' | 'center';
	dark?: boolean;
	children?: ReactNode;
}

/** Encabezado de sección con cadencia variable (alineación y kicker opcionales). */
export default function SectionHead({
	kicker,
	title,
	description,
	align = 'left',
	dark = false,
}: SectionHeadProps) {
	const alignCls = align === 'center' ? 'items-center text-center' : 'items-start text-left';
	return (
		<Reveal className={`flex flex-col gap-4 ${alignCls}`}>
			{kicker ? (
				<p
					className={`text-xs font-semibold tracking-[0.22em] uppercase ${
						dark ? 'text-rojo-200' : 'text-rojo-500'
					}`}
				>
					{kicker}
				</p>
			) : null}
			<h2
				className={`max-w-2xl text-4xl leading-[1.08] sm:text-5xl ${
					dark ? 'text-white' : 'text-rojo-700'
				}`}
			>
				{title}
			</h2>
			{description ? (
				<p
					className={`max-w-2xl text-base leading-relaxed text-pretty sm:text-lg ${
						dark ? 'text-white/80' : 'text-rojo-700/70'
					}`}
				>
					{description}
				</p>
			) : null}
		</Reveal>
	);
}
