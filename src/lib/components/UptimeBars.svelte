<script lang="ts">
	interface UptimeData {
		status: 'up' | 'down' | 'unknown';
		timestamp: number;
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
				class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-[#242830] border border-[#363b45] rounded-md text-[11px] text-[#e8eaed] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-10"
			>
				{formatTimestamp(data.timestamp)}
			</div>
		</div>
	{/each}
</div>
