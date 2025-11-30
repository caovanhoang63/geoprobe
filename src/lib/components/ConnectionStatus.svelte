<script lang="ts">
	interface Props {
		connected: boolean;
	}

	const { connected }: Props = $props();

	const statusText = $derived(connected ? 'Live' : 'Disconnected');
	const statusColor = $derived(connected ? 'bg-emerald-500' : 'bg-gray-500');
	const pulseClass = $derived(connected ? 'animate-pulse' : '');
</script>

<div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2a2f38] border border-[#3a3f4a]">
	<div class="relative">
		<div class="w-2 h-2 rounded-full {statusColor}"></div>
		{#if connected}
			<div class="absolute inset-0 w-2 h-2 rounded-full {statusColor} {pulseClass} opacity-75"></div>
		{/if}
	</div>
	<span class="text-sm text-[#9ca3af]">{statusText}</span>
</div>
