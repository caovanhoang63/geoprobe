<script lang="ts">
	import type { Location } from '$lib/types/location';
	import { getLocationEmoji } from '$lib/data/locations';

	interface Props {
		location: Location;
		selected: boolean;
		onclick: () => void;
	}

	const { location, selected, onclick }: Props = $props();

	const emoji = $derived(getLocationEmoji(location));
	const probeText = $derived(
		location.probeCount ? `${location.probeCount.toLocaleString()} probes` : ''
	);
</script>

<button
	type="button"
	{onclick}
	class="group w-[180px] h-[140px] rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:ring-offset-2 focus:ring-offset-[#1a1d21]
		{selected
		? 'bg-[#1a3e32] border-[#10b981] ring-[3px] ring-[#10b981]/30'
		: 'bg-[#242830] border-[#2d3139] hover:bg-[#2a2f38] hover:border-[#10b981] hover:shadow-[0_4px_16px_rgba(16,185,129,0.15)]'}"
>
	<span class="text-[48px] leading-none select-none">{emoji}</span>
	<span class="text-base font-semibold text-[#e8eaed] text-center px-2 truncate max-w-full">
		{location.name}
	</span>
	{#if probeText}
		<span class="text-xs text-[#9ca3af]">{probeText}</span>
	{/if}
</button>
