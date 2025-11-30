<script lang="ts">
	interface LocationItem {
		id: string;
		name: string;
		color: string;
		value?: number;
		enabled: boolean;
	}

	interface Props {
		locations: LocationItem[];
		onToggle: (locationId: string) => void;
	}

	const { locations, onToggle }: Props = $props();
</script>

<div class="flex flex-wrap gap-4">
	{#each locations as location (location.id)}
		<button
			type="button"
			onclick={() => onToggle(location.id)}
			class="flex items-center gap-2 bg-[#2a2f38] px-1.5 py-1.5 rounded-md transition-all duration-150 hover:bg-[#363b45] {location.enabled ? '' : 'opacity-40'}"
		>
			<div
				class="w-3 h-3 rounded-[3px] flex-shrink-0"
				style="background-color: {location.color}"
			></div>
			<span class="text-[12px] text-[#e8eaed]">{location.name}</span>
			{#if location.value !== undefined}
				<span class="text-[11px] text-[#9ca3af]">{location.value}ms</span>
			{/if}
		</button>
	{/each}
</div>
