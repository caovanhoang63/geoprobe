<script lang="ts">
	import { Chart, registerables } from 'chart.js';
	import { onMount } from 'svelte';
	import { getBaseLineChartOptions, getLineDatasetDefaults, formatChartTimestamp } from '$lib/utils/chart-config';

	Chart.register(...registerables);

	type TimeRange = '3h' | '24h' | '7d' | '30d';

	interface ChartDataPoint {
		timestamp: number;
		location: string;
		responseTime: number;
	}

	interface LocationConfig {
		id: string;
		name: string;
		color: string;
	}

	interface Props {
		data: ChartDataPoint[];
		locations: LocationConfig[];
		timeRange: TimeRange;
		onTimeRangeChange: (range: TimeRange) => void;
	}

	const { data, locations, timeRange, onTimeRangeChange }: Props = $props();

	const timeRangeOptions: { value: TimeRange; label: string }[] = [
		{ value: '3h', label: '3h' },
		{ value: '24h', label: '24h' },
		{ value: '7d', label: '7d' },
		{ value: '30d', label: '30d' }
	];

	let canvasElement: HTMLCanvasElement | undefined = $state();
	let chartInstance: Chart<'line'> | null = null;

	const chartData = $derived.by(() => {
		const timestamps = [...new Set(data.map((d) => d.timestamp))].sort((a, b) => a - b);
		const labels = timestamps.map((ts) => formatChartTimestamp(ts, timeRange));

		const datasets = locations.map((loc) => {
			const locationData = data.filter((d) => d.location === loc.id);
			const values = timestamps.map((ts) => {
				const point = locationData.find((d) => d.timestamp === ts);
				return point?.responseTime ?? null;
			});

			return {
				label: loc.name,
				data: values,
				...getLineDatasetDefaults(loc.color)
			};
		});

		return { labels, datasets };
	});

	$effect(() => {
		if (!canvasElement) return;

		const currentData = chartData;

		if (chartInstance) {
			chartInstance.data = currentData;
			chartInstance.update('none');
		} else {
			const ctx = canvasElement.getContext('2d');
			if (!ctx) return;

			chartInstance = new Chart(ctx, {
				type: 'line',
				data: currentData,
				options: getBaseLineChartOptions()
			});
		}
	});

	onMount(() => {
		return () => {
			if (chartInstance) {
				chartInstance.destroy();
				chartInstance = null;
			}
		};
	});
</script>

<div class="bg-[#242830] rounded-xl p-6">
	<div class="flex items-center justify-between mb-6">
		<h2 class="text-lg font-semibold text-[#e8eaed]">Response Time</h2>
		<div class="flex bg-[#1c1f24] rounded-full p-1">
			{#each timeRangeOptions as option (option.value)}
				<button
					type="button"
					onclick={() => onTimeRangeChange(option.value)}
					class="px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-150 {timeRange === option.value
						? 'bg-[#10b981] text-white'
						: 'text-[#9ca3af] hover:text-[#e8eaed]'}"
				>
					{option.label}
				</button>
			{/each}
		</div>
	</div>
	<div class="bg-[#1c1f24] rounded-lg p-4 h-[300px]">
		<canvas bind:this={canvasElement}></canvas>
	</div>
</div>
