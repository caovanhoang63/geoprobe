import type { ChartOptions, TooltipItem } from 'chart.js';

export const CHART_COLORS = {
	background: '#1c1f24',
	grid: '#2a2f38',
	border: '#363b45',
	labelPrimary: '#e8eaed',
	labelSecondary: '#9ca3af',
	labelTertiary: '#6b7280',
	tooltipBackground: '#242830',
	success: '#10b981',
	danger: '#ef4444',
	warning: '#f59e0b'
} as const;

export const LOCATION_COLORS = [
	'#10b981',
	'#3b82f6',
	'#f59e0b',
	'#ef4444',
	'#8b5cf6',
	'#ec4899',
	'#06b6d4',
	'#84cc16'
] as const;

export function getBaseLineChartOptions(): ChartOptions<'line'> {
	return {
		responsive: true,
		maintainAspectRatio: false,
		animation: {
			duration: 300
		},
		interaction: {
			mode: 'index',
			intersect: false
		},
		plugins: {
			legend: {
				display: false
			},
			tooltip: {
				backgroundColor: CHART_COLORS.tooltipBackground,
				titleColor: CHART_COLORS.labelPrimary,
				bodyColor: CHART_COLORS.labelSecondary,
				borderColor: CHART_COLORS.border,
				borderWidth: 1,
				padding: 12,
				cornerRadius: 8,
				titleFont: {
					family: 'Inter',
					size: 12,
					weight: 600
				},
				bodyFont: {
					family: 'Inter',
					size: 11
				},
				callbacks: {
					label: (context: TooltipItem<'line'>) => {
						return `${context.dataset.label}: ${context.parsed.y}ms`;
					}
				}
			}
		},
		scales: {
			x: {
				grid: {
					color: CHART_COLORS.grid,
					drawTicks: false
				},
				border: {
					display: false
				},
				ticks: {
					color: CHART_COLORS.labelTertiary,
					font: {
						family: 'Inter',
						size: 11
					},
					padding: 8
				}
			},
			y: {
				grid: {
					color: CHART_COLORS.grid,
					drawTicks: false
				},
				border: {
					display: false
				},
				ticks: {
					color: CHART_COLORS.labelTertiary,
					font: {
						family: 'Inter',
						size: 11
					},
					padding: 8,
					callback: (value: string | number) => `${value}ms`
				},
				beginAtZero: true
			}
		}
	};
}

export function getLineDatasetDefaults(color: string) {
	return {
		borderColor: color,
		backgroundColor: `${color}20`,
		borderWidth: 2,
		pointRadius: 3,
		pointHoverRadius: 5,
		pointBackgroundColor: color,
		pointBorderColor: color,
		pointHoverBackgroundColor: color,
		pointHoverBorderColor: '#ffffff',
		tension: 0.4,
		fill: false
	};
}

export function formatChartTimestamp(timestamp: number, timeRange: '3h' | '24h' | '7d' | '30d'): string {
	const date = new Date(timestamp);

	switch (timeRange) {
		case '3h':
		case '24h':
			return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
		case '7d':
			return date.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', hour12: true });
		case '30d':
			return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}
}
