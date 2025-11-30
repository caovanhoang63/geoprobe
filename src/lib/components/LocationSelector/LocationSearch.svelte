<script lang="ts">
	interface Props {
		query: string;
		onSearch: (query: string) => void;
	}

	const { query, onSearch }: Props = $props();

	function handleInput(event: Event): void {
		const target = event.target as HTMLInputElement;
		onSearch(target.value);
	}

	function handleClear(): void {
		onSearch('');
	}
</script>

<div class="relative flex-1 min-w-[200px]">
	<span
		class="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none select-none"
		aria-hidden="true"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="w-4 h-4"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
			/>
		</svg>
	</span>
	<input
		type="text"
		value={query}
		oninput={handleInput}
		placeholder="Search locations..."
		class="w-full pl-10 pr-8 py-2.5 bg-[#2a2f38] border border-[#363b45] rounded-lg text-[#e8eaed] text-sm placeholder-[#6b7280] transition-all duration-150 focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20"
	/>
	{#if query}
		<button
			type="button"
			onclick={handleClear}
			class="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#363b45] flex items-center justify-center text-[#9ca3af] text-xs hover:bg-[#4b5563] hover:text-[#e8eaed] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
			aria-label="Clear search"
		>
			&times;
		</button>
	{/if}
</div>
