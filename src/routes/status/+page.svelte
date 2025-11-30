<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import StatusHeader from '$lib/components/StatusHeader.svelte';
	import StatusItem from '$lib/components/StatusItem.svelte';

	interface Props {
		data: {
			monitors: Array<any>;
			overallStatus: 'operational' | 'degraded';
			lastUpdated: string;
		};
	}

	const { data }: Props = $props();

	let refreshInterval: ReturnType<typeof setInterval> | null = null;

	onMount(() => {
		refreshInterval = setInterval(() => {
			invalidateAll();
		}, 60000);
	});

	onDestroy(() => {
		if (refreshInterval) {
			clearInterval(refreshInterval);
		}
	});
</script>

<svelte:head>
	<title>Status - GeoProbe</title>
	<meta name="description" content="Real-time status of GeoProbe monitored services" />
</svelte:head>

<div class="min-h-screen bg-slate-900">
	<div class="max-w-4xl mx-auto px-4 py-8">
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-white mb-2">Service Status</h1>
			<p class="text-slate-400">Real-time monitoring of our services</p>
		</div>

		<StatusHeader status={data.overallStatus} lastUpdated={data.lastUpdated} />

		{#if data.monitors.length === 0}
			<div class="text-center py-12">
				<p class="text-slate-400 text-lg">No public monitors available</p>
			</div>
		{:else}
			<div class="space-y-4">
				{#each data.monitors as monitor (monitor.id)}
					<StatusItem {monitor} />
				{/each}
			</div>
		{/if}

		<footer class="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
			<p>Powered by GeoProbe · Updates every 60 seconds</p>
		</footer>
	</div>
</div>
