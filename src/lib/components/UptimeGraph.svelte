<script lang="ts">
	interface UptimeData {
		status: 'up' | 'down' | 'unknown';
		timestamp: number;
	}

	interface Props {
		data: UptimeData[];
	}

	const { data }: Props = $props();

	function formatDate(timestamp: number): string {
		const date = new Date(timestamp);
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		const month = months[date.getMonth()];
		const day = date.getDate();
		const hours = date.getHours().toString().padStart(2, '0');
		const minutes = date.getMinutes().toString().padStart(2, '0');
		return `${month} ${day}, ${hours}:${minutes}`;
	}

	function getBarColor(status: 'up' | 'down' | 'unknown'): string {
		return {
			up: '#10b981',
			down: '#ef4444',
			unknown: '#6b7280'
		}[status];
	}

	const bars = $derived(data.slice(-90));
</script>

<div class="flex items-end gap-1 h-10 relative">
	{#each bars as bar, index}
		<div class="relative group flex-1 min-w-[2px]">
			<div
				class="h-full rounded-sm transition-all duration-200 hover:scale-y-110"
				style="background-color: {getBarColor(bar.status)};"
			></div>
			<div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
				<div class="bg-slate-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap border border-slate-700">
					{formatDate(bar.timestamp)}
				</div>
			</div>
		</div>
	{/each}
</div>

<div class="flex items-center gap-4 mt-3 text-xs text-slate-400">
	<div class="flex items-center gap-1.5">
		<div class="w-3 h-3 rounded-sm" style="background-color: #10b981;"></div>
		<span>Up</span>
	</div>
	<div class="flex items-center gap-1.5">
		<div class="w-3 h-3 rounded-sm" style="background-color: #ef4444;"></div>
		<span>Down</span>
	</div>
	<div class="flex items-center gap-1.5">
		<div class="w-3 h-3 rounded-sm" style="background-color: #6b7280;"></div>
		<span>Unknown</span>
	</div>
	<span class="ml-auto">Last 90 days</span>
</div>
