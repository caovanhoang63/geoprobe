<script lang="ts">
	import type { MonitorWithStatus } from '$lib/server/monitors';

	interface Props {
		monitor: MonitorWithStatus;
	}

	const { monitor }: Props = $props();

	const statusConfig = $derived({
		up: { icon: '🟢', text: 'Operational', color: '#10b981' },
		down: { icon: '🔴', text: 'Down', color: '#ef4444' },
		unknown: { icon: '⚪', text: 'Unknown', color: '#6b7280' }
	}[monitor.latestStatus]);

	const uptime30d = $derived(monitor.uptime30d ?? 0);
	const avgLatency = $derived(monitor.avgLatency ?? 0);
</script>

<div class="rounded-lg bg-slate-800 border border-slate-700 p-5 mb-4">
	<div class="flex items-start justify-between mb-3">
		<div class="flex items-center gap-3">
			<span class="text-2xl">{statusConfig.icon}</span>
			<div>
				<h3 class="text-lg font-semibold text-white">{monitor.name}</h3>
				<p class="text-sm text-slate-400 mt-0.5">{monitor.url}</p>
			</div>
		</div>
		<span class="px-3 py-1 rounded-full text-sm font-medium" style="color: {statusConfig.color}; background-color: {statusConfig.color}20;">
			{statusConfig.text}
		</span>
	</div>

	<div class="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-700">
		<div>
			<p class="text-xs text-slate-500 mb-1">30-day uptime</p>
			<p class="text-lg font-semibold text-white">{uptime30d.toFixed(1)}%</p>
		</div>
		<div>
			<p class="text-xs text-slate-500 mb-1">Avg response time</p>
			<p class="text-lg font-semibold text-white">{avgLatency}ms</p>
		</div>
	</div>
</div>
