import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

/* ——— Colores y tipografía desde src/styles/global.css ———
   El componente lee los tokens CSS del :root al hidratar,
   así cualquier cambio en global.css se refleja en la gráfica. */

/* Fallbacks: mismos valores que los tokens, usados antes de
   hidratar (SSR) o si algún token no estuviera definido. */
const FALLBACK = {
	hi: '#2E0505', // --color-rojo-700  · texto protagonista
	mid: '#480808', // --color-rojo-600  · barra 2026 / ejes
	muted: '#A85656', // --color-rojo-300  · texto secundario
	line: '#E6CFCF', // --color-rojo-100  · grid
	soft: '#CD9F9F', // --color-rojo-200  · barra 2025
	font: "'Inter Variable', ui-sans-serif, system-ui, sans-serif", // --font-sans
};

const TOKENS = {
	hi: '--color-rojo-700',
	mid: '--color-rojo-600',
	muted: '--color-rojo-300',
	line: '--color-rojo-100',
	soft: '--color-rojo-200',
	font: '--font-sans',
};

const leerToken = (styles, nombre, fallback) => {
	const valor = styles.getPropertyValue(nombre).trim();
	return valor || fallback;
};

const GraficaEmpleoKora = ({ height = 420 }) => {
	const chartHeight = typeof height === 'number' ? `${height}px` : height;

	/* Arranca con los fallbacks (= valores de los tokens) y, al
	   montar en el cliente, lee los tokens reales de global.css */
	const [c, setC] = useState(FALLBACK);

	useEffect(() => {
		if (typeof document === 'undefined') return undefined;
		const styles = getComputedStyle(document.documentElement);
		setC({
			hi: leerToken(styles, TOKENS.hi, FALLBACK.hi),
			mid: leerToken(styles, TOKENS.mid, FALLBACK.mid),
			muted: leerToken(styles, TOKENS.muted, FALLBACK.muted),
			line: leerToken(styles, TOKENS.line, FALLBACK.line),
			soft: leerToken(styles, TOKENS.soft, FALLBACK.soft),
			font: leerToken(styles, TOKENS.font, FALLBACK.font),
		});
		return undefined;
	}, []);

	const series = [
		{
			name: 'Septiembre 2025',
			data: [63.9, 58.7, 8.2],
			color: c.soft, // rojo-200: tono apagado, periodo anterior
		},
		{
			name: 'Septiembre 2026',
			data: [63.8, 58.7, 8.0],
			color: c.mid, // rojo-600: rojo Kora intenso, periodo actual
		},
	];

	const options = {
		chart: {
			type: 'bar',
			height: chartHeight,
			fontFamily: c.font,
			foreColor: c.muted,
			toolbar: { show: false },
			zoom: { enabled: false },
			animations: {
				enabled: true,
				speed: 600,
				animateGradually: { enabled: true, delay: 120 },
			},
			background: 'transparent',
		},

		// Gradiente vertical sutil para dar volumen sin sobrecargar
		fill: {
			type: 'gradient',
			gradient: {
				type: 'vertical',
				shadeIntensity: 0.15,
				opacityFrom: 1,
				opacityTo: 0.82,
				stops: [0, 100],
			},
		},

		stroke: {
			show: true,
			width: 1,
			colors: ['#fff', '#fff'],
		},

		plotOptions: {
			bar: {
				borderRadius: 6,
				borderRadiusApplication: 'end', // solo esquinas superiores
				columnWidth: '42%',
				horizontal: false,
				/* Valores centrados en la mitad de cada barra */
				dataLabels: {
					position: 'center',
					hideOverflowingLabels: false,
				},
			},
		},

		dataLabels: {
			enabled: true,
			offsetY: 0,
			formatter: (val) => `${val.toFixed(1).replace('.', ',')}%`,
			style: {
				fontSize: '12px',
				fontWeight: 600,
				fontFamily: c.font,
				colors: [c.hi],
			},
			/* "Chip" blanco detrás del valor: legible sobre barras
			   claras, oscuras y en móvil cuando la barra es angosta */
			background: {
				enabled: true,
				borderRadius: 6,
				opacity: 0.95,
				foreColor: c.hi,
				borderWidth: 0,
				padding: {
					left: 5,
					right: 5,
					top: 2,
					bottom: 2,
				},
			},
			dropShadow: { enabled: false },
		},

		xaxis: {
			categories: [
				'Tasa Global de Participación (TGP)',
				'Tasa de Ocupación (TO)',
				'Tasa de Desocupación (TD)',
			],
			axisBorder: { show: false },
			axisTicks: { show: false },
			labels: {
				hideOverlappingLabels: true,
				style: {
					fontFamily: c.font,
					fontSize: '13px',
					fontWeight: 500,
					colors: c.mid,
				},
			},
			crosshairs: { show: false },
			tooltip: { enabled: false },
		},

		yaxis: {
			min: 0,
			max: 70,
			tickAmount: 7, // intervalos exactos de 10 (0…70)
			axisBorder: { show: false },
			axisTicks: { show: false },
			labels: {
				formatter: (val) => `${val}%`,
				style: {
					fontFamily: c.font,
					fontSize: '12px',
					colors: c.muted,
				},
			},
		},

		// Grid: solo líneas horizontales punteadas, muy sutiles
		grid: {
			show: true,
			borderColor: c.line,
			strokeDashArray: 5,
			position: 'back',
			xaxis: { lines: { show: false } },
			yaxis: { lines: { show: true } },
			padding: { top: 8, bottom: 4 },
		},

		tooltip: {
			shared: true,
			intersect: false,
			theme: 'light',
			fontFamily: c.font,
			cssClass: 'kora-chart-tooltip',
			y: {
				formatter: (val) => `${val.toFixed(1).replace('.', ',')}%`,
			},
		},

		legend: {
			position: 'top',
			horizontalAlign: 'right',
			fontFamily: c.font,
			fontSize: '13px',
			fontWeight: 500,
			markers: { size: 9, strokeWidth: 0, shape: 'rounded' },
			itemMargin: { horizontal: 8 },
			onItemClick: { toggleDataSeries: true },
		},

		states: {
			hover: { filter: { type: 'darken', value: 0.92 } },
			active: { filter: { type: 'none' } },
		},
	};

	return (
		<figure
			className="m-0 rounded-3xl border border-rojo-700/10 bg-white/70 p-4 shadow-[0_16px_40px_-20px_rgba(46,5,5,0.3)] backdrop-blur sm:p-8"
			// Tarjeta de vidrio: clases Tailwind generadas desde los tokens de global.css
		>
			<ReactApexChart
				options={options}
				series={series}
				type="bar"
				height={chartHeight}
			/>
		</figure>
	);
};

export default GraficaEmpleoKora;
