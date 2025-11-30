<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';
	import MonitorListItem from '$lib/components/MonitorListItem.svelte';
	import UptimeBars from '$lib/components/UptimeBars.svelte';
	import ActionButtons from '$lib/components/ActionButtons.svelte';
	import MetricsGrid from '$lib/components/MetricsGrid.svelte';
	import ResponseChart from '$lib/components/ResponseChart.svelte';
	import LocationLegend from '$lib/components/LocationLegend.svelte';
	import ConnectionStatus from '$lib/components/ConnectionStatus.svelte';
	import { MonitorFormModal } from '$lib/components/MonitorForm';
	import { LOCATION_COLORS } from '$lib/utils/chart-config';
	import { createRealtimeStore } from '$lib/stores/realtime.svelte';
	import type { MonitorFormData, MonitorEditData, MonitorFormMode } from '$lib/types/monitor-form';
	import type { SelectedLocation } from '$lib/types/location';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	const { data }: Props = $props();

	interface Monitor {
		id: string;
		name: string;
		url: string;
		status: 'up' | 'down' | 'unknown';
		uptimePercentage: number;
		uptimeHistory: Array<{ status: 'up' | 'down' | 'unknown'; timestamp: number }>;
		interval?: number;
		locations?: SelectedLocation[];
		discordWebhook?: string;
	}

	interface ChartDataPoint {
		timestamp: number;
		location: string;
		responseTime: number;
	}

	interface LocationConfig {
		id: string;
		name: string;
		color: string;
		value?: number;
		enabled: boolean;
	}

	type TimeRange = '3h' | '24h' | '7d' | '30d';

	function generateUptimeHistory(): Array<{ status: 'up' | 'down' | 'unknown'; timestamp: number }> {
		const now = Date.now();
		const history: Array<{ status: 'up' | 'down' | 'unknown'; timestamp: number }> = [];
		for (let i = 29; i >= 0; i--) {
			const timestamp = now - i * 60 * 60 * 1000;
			const random = Math.random();
			const status: 'up' | 'down' | 'unknown' = random > 0.9 ? 'down' : random > 0.85 ? 'unknown' : 'up';
			history.push({ status, timestamp });
		}
		return history;
	}

	function generateChartData(timeRange: TimeRange, locationIds: string[]): ChartDataPoint[] {
		const now = Date.now();
		const data: ChartDataPoint[] = [];
		const intervals = { '3h': 12, '24h': 24, '7d': 28, '30d': 30 };
		const msPerInterval = { '3h': 15 * 60 * 1000, '24h': 60 * 60 * 1000, '7d': 6 * 60 * 60 * 1000, '30d': 24 * 60 * 60 * 1000 };

		const count = intervals[timeRange];
		const interval = msPerInterval[timeRange];

		for (let i = count - 1; i >= 0; i--) {
			const timestamp = now - i * interval;
			for (const locationId of locationIds) {
				const baseTime = 150 + Math.random() * 200;
				data.push({ timestamp, location: locationId, responseTime: Math.round(baseTime) });
			}
		}
		return data;
	}

	const realtime = createRealtimeStore();

	const monitors = $derived(
		data.monitors.map((m) => {
			const realtimeUpdate = realtime.getMonitorUpdate(m.id);
			return {
				id: m.id,
				name: m.name,
				url: m.url,
				status: (realtimeUpdate?.status ?? (m.latestStatus === 'unknown' ? 'down' : m.latestStatus)) as 'up' | 'down',
				uptimePercentage: realtimeUpdate?.uptime24h ?? m.uptime24h,
				uptimeHistory: generateUptimeHistory(),
				interval: m.interval,
				locations: JSON.parse(m.locations),
				discordWebhook: ''
			};
		})
	);

	let selectedMonitorId = $state<string>('');

	$effect(() => {
		if (!selectedMonitorId && monitors.length > 0 && monitors[0]) {
			selectedMonitorId = monitors[0].id;
		}
	});

	$effect(() => {
		realtime.connect();
		return () => {
			realtime.disconnect();
		};
	});
	let chartTimeRange: TimeRange = $state('24h');
	let chartLocations: LocationConfig[] = $state([
		{ id: 'us-east', name: 'US East', color: LOCATION_COLORS[0], value: 142, enabled: true },
		{ id: 'eu-west', name: 'EU West', color: LOCATION_COLORS[1], value: 198, enabled: true },
		{ id: 'asia-sg', name: 'Asia (SG)', color: LOCATION_COLORS[2], value: 267, enabled: true },
		{ id: 'au-syd', name: 'Australia', color: LOCATION_COLORS[3], value: 312, enabled: true }
	]);

	let formModalOpen = $state(false);
	let formMode: MonitorFormMode = $state('create');
	let editMonitorData = $state<MonitorEditData | undefined>(undefined);

	const selectedMonitor = $derived(monitors.find((m) => m.id === selectedMonitorId)!);

	const enabledLocations = $derived(chartLocations.filter((l) => l.enabled));

	const chartData = $derived(generateChartData(chartTimeRange, enabledLocations.map((l) => l.id)));

	const metricsData = $derived({
		currentResponse: 156,
		avgResponse24h: 189,
		uptime24h: selectedMonitor?.uptimePercentage ?? 100,
		uptime30d: 99.8,
		certExpiry: 45,
		certUrl: selectedMonitor?.url
	});

	function handleAddMonitor(): void {
        console.log('hello world')
		formMode = 'create';
		editMonitorData = undefined;
		formModalOpen = true;
	}

	async function handlePause(): Promise<void> {
		if (!selectedMonitor) return;

		try {
			const response = await fetch(`/api/monitors/${selectedMonitor.id}/pause`, {
				method: 'POST'
			});

			if (!response.ok) {
				const error = await response.json();
				console.error('Failed to pause monitor:', error);
				return;
			}

			window.location.reload();
		} catch (error) {
			console.error('Error pausing monitor:', error);
		}
	}

	function handleEdit(): void {
		if (!selectedMonitor) return;

		formMode = 'edit';
		editMonitorData = {
			id: selectedMonitor.id,
			name: selectedMonitor.name,
			url: selectedMonitor.url,
			interval: selectedMonitor.interval ?? 300,
			locations: selectedMonitor.locations ?? [],
			discordWebhook: selectedMonitor.discordWebhook
		};
		formModalOpen = true;
	}

	async function handleDelete(): Promise<void> {
		if (!selectedMonitor) return;

		if (!confirm(`Are you sure you want to delete "${selectedMonitor.name}"?`)) {
			return;
		}

		try {
			const response = await fetch(`/api/monitors/${selectedMonitor.id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				const error = await response.json();
				console.error('Failed to delete monitor:', error);
				return;
			}

			window.location.reload();
		} catch (error) {
			console.error('Error deleting monitor:', error);
		}
	}

	function handleFormClose(): void {
		formModalOpen = false;
		editMonitorData = undefined;
	}

	async function handleFormSave(formData: MonitorFormData): Promise<void> {
		try {
			if (formMode === 'create') {
				const response = await fetch('/api/monitors', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(formData)
				});

				if (!response.ok) {
					const error = await response.json();
					console.error('Failed to create monitor:', error);
					return;
				}
			} else {
				const response = await fetch(`/api/monitors/${editMonitorData?.id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(formData)
				});

				if (!response.ok) {
					const error = await response.json();
					console.error('Failed to update monitor:', error);
					return;
				}
			}

			formModalOpen = false;
			editMonitorData = undefined;
			window.location.reload();
		} catch (error) {
			console.error('Error saving monitor:', error);
		}
	}

	async function handleFormDelete(): Promise<void> {
		if (!editMonitorData?.id) return;

		if (!confirm(`Are you sure you want to delete "${editMonitorData.name}"?`)) {
			return;
		}

		try {
			const response = await fetch(`/api/monitors/${editMonitorData.id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				const error = await response.json();
				console.error('Failed to delete monitor:', error);
				return;
			}

			formModalOpen = false;
			editMonitorData = undefined;
			window.location.reload();
		} catch (error) {
			console.error('Error deleting monitor:', error);
		}
	}

	function handleTimeRangeChange(range: TimeRange): void {
		chartTimeRange = range;
	}

	function handleLocationToggle(locationId: string): void {
		chartLocations = chartLocations.map((loc) =>
			loc.id === locationId ? { ...loc, enabled: !loc.enabled } : loc
		);
	}
</script>

<div class="min-h-screen bg-[#1a1d21] text-[#e8eaed]">
	<Sidebar onAddMonitor={handleAddMonitor}>
		{#each monitors as monitor}
			<MonitorListItem
				{monitor}
				active={monitor.id === selectedMonitorId}
				onclick={() => (selectedMonitorId = monitor.id)}
			/>
		{/each}
	</Sidebar>

	<main class="ml-[280px] p-10">
		<div class="max-w-7xl mx-auto">
			<div class="mb-8 flex items-start justify-between">
				<div>
					<h1 class="text-4xl font-bold mb-2">{selectedMonitor?.name}</h1>
					<p class="text-base text-[#9ca3af]">{selectedMonitor?.url}</p>
				</div>
				<ConnectionStatus connected={realtime.connected} />
			</div>

			<div class="bg-[#242830] rounded-xl p-6 mb-8">
				<div class="flex items-center justify-between mb-6">
					<div>
						<h2 class="text-lg font-semibold mb-1">Uptime History (Last 30 Hours)</h2>
						<p class="text-sm text-[#9ca3af]">
							{selectedMonitor?.uptimePercentage}% uptime in the last 30 hours
						</p>
					</div>
					<div
						class="px-4 py-2 rounded-full text-sm font-semibold {selectedMonitor?.status === 'up'
							? 'bg-[#10b981] text-white'
							: 'bg-[#ef4444] text-white'}"
					>
						{selectedMonitor?.status === 'up' ? 'Up' : 'Down'}
					</div>
				</div>

				{#if selectedMonitor}
					<UptimeBars uptimeData={selectedMonitor.uptimeHistory} />
				{/if}
			</div>

			<div class="bg-[#242830] rounded-xl p-6 mb-8">
				<h2 class="text-lg font-semibold mb-4">Metrics</h2>
				<MetricsGrid
					currentResponse={metricsData.currentResponse}
					avgResponse24h={metricsData.avgResponse24h}
					uptime24h={metricsData.uptime24h}
					uptime30d={metricsData.uptime30d}
					certExpiry={metricsData.certExpiry}
					certUrl={metricsData.certUrl}
				/>
			</div>

			<div class="mb-8">
				<ResponseChart
					data={chartData}
					locations={enabledLocations}
					timeRange={chartTimeRange}
					onTimeRangeChange={handleTimeRangeChange}
				/>
				<div class="mt-4">
					<LocationLegend locations={chartLocations} onToggle={handleLocationToggle} />
				</div>
			</div>

			<div class="bg-[#242830] rounded-xl p-6">
				<h2 class="text-lg font-semibold mb-4">Actions</h2>
				<ActionButtons onPause={handlePause} onEdit={handleEdit} onDelete={handleDelete} />
			</div>
		</div>
	</main>
</div>

<MonitorFormModal
	open={formModalOpen}
	mode={formMode}
	monitor={editMonitorData}
	onClose={handleFormClose}
	onSave={handleFormSave}
	onDelete={handleFormDelete}
/>
