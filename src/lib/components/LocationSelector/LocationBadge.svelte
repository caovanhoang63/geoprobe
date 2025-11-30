<script lang="ts">
	import type { SelectedLocation } from '$lib/types/location';
	import { getLocationEmoji } from '$lib/data/locations';

	interface Props {
		location: SelectedLocation;
		onRemove: () => void;
	}

	const { location, onRemove }: Props = $props();

	const emoji = $derived(getLocationEmoji(location.location));
	const isResidential = $derived(location.networkType === 'residential');
	const isDatacenter = $derived(location.networkType === 'datacenter');
	const networkColor = $derived(isResidential ? '#10b981' : isDatacenter ? '#3b82f6' : '#9ca3af');
</script>

<div
	class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#2a2f38] border border-[#363b45]"
	style="border-left: 3px solid {location.color}"
>
	<span
		class="w-2 h-2 rounded-full flex-shrink-0"
		style="background-color: {networkColor}"
		title={location.networkType === 'any' ? 'Any network' : location.networkType}
	></span>
	<span class="text-sm leading-none select-none">{emoji}</span>
	<span class="text-sm text-[#e8eaed] whitespace-nowrap">{location.location.name}</span>
	{#if location.isp}
		<span class="text-xs text-[#6b7280]">({location.isp})</span>
	{/if}
	<button
		type="button"
		onclick={onRemove}
		class="w-[18px] h-[18px] rounded-full bg-[#363b45] flex items-center justify-center text-[#9ca3af] text-xs leading-none transition-colors duration-150 hover:bg-[#ef4444] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#ef4444]"
		aria-label="Remove {location.location.name}"
	>
		&times;
	</button>
</div>
