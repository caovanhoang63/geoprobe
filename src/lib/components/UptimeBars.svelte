<script lang="ts">
	interface LocationLatency {
		location: string;
		latency: number;
		status: string;
	}

	interface UptimeData {
		status: 'up' | 'down' | 'unknown';
		timestamp: number;
		locations?: LocationLatency[];
	}

	interface Props {
		uptimeData: UptimeData[];
	}

	const { uptimeData }: Props = $props();

	function formatTimestamp(timestamp: number): string {
		const date = new Date(timestamp);
		const month = date.toLocaleDateString('en-US', { month: 'short' });
		const day = date.getDate();
		const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
		return `${month} ${day}, ${time}`;
	}

	function getLatencyColor(latency: number): string {
		if (latency < 200) return '#10b981';
		if (latency < 500) return '#f59e0b';
		return '#ef4444';
	}

	function getLatencyClass(latency: number): string {
		if (latency < 200) return 'text-[#10b981]';
		if (latency < 500) return 'text-[#f59e0b]';
		return 'text-[#ef4444]';
	}
</script>

<div class="flex gap-1 items-end h-10">
	{#each uptimeData as data, i (i)}
		<div
			class="relative w-3 h-full rounded cursor-pointer transition-all duration-200 hover:scale-y-110 group {data.status ===
			'up'
				? 'bg-[#10b981] hover:shadow-[0_0_8px_rgba(16,185,129,0.5)]'
				: data.status === 'down'
					? 'bg-[#ef4444] hover:shadow-[0_0_8px_rgba(239,68,68,0.5)]'
					: 'bg-[#6b7280] hover:shadow-[0_0_8px_rgba(107,114,128,0.5)]'}"
		>
			<div
				class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#242830] border border-[#363b45] rounded-lg text-[11px] text-[#e8eaed] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-10 shadow-lg"
			>
				<div class="font-semibold mb-1.5 text-[#9ca3af]">{formatTimestamp(data.timestamp)}</div>
				{#if data.locations && data.locations.length > 0}
					<div class="space-y-1">
						{#each data.locations as loc}
							<div class="flex items-center justify-between gap-4">
								<span class="text-[#e8eaed] truncate max-w-[120px]">{loc.location}</span>
								<span class="font-mono font-semibold {getLatencyClass(loc.latency)}">
									{Math.round(loc.latency)}ms
								</span>
							</div>
						{/each}
					</div>
				{:else}
					<div class="text-[#6b7280]">No data</div>
				{/if}
			</div>
		</div>
	{/each}
</div>
