<script lang="ts">
	import type { NetworkFilter } from '$lib/types/location';

	interface Props {
		value: NetworkFilter;
		onChange: (value: NetworkFilter) => void;
	}

	const { value, onChange }: Props = $props();

	const options: { label: string; filter: NetworkFilter }[] = [
		{ label: 'All', filter: 'all' },
		{ label: 'Residential', filter: 'residential' },
		{ label: 'Datacenter', filter: 'datacenter' }
	];

	function handleClick(filter: NetworkFilter): void {
		onChange(filter);
	}
</script>

<div
	class="inline-flex rounded-lg bg-[#242830] border border-[#363b45] p-1"
	role="radiogroup"
	aria-label="Network type filter"
>
	{#each options as option (option.filter)}
		<button
			type="button"
			role="radio"
			aria-checked={value === option.filter}
			onclick={() => handleClick(option.filter)}
			class="px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:ring-inset
				{value === option.filter
				? 'bg-[#10b981] text-white'
				: 'text-[#9ca3af] hover:text-[#e8eaed] hover:bg-[#2a2f38]'}"
		>
			{option.label}
		</button>
	{/each}
</div>
