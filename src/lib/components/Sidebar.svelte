<script lang="ts">
	import { type Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
		onAddMonitor?: () => void;
	}

	const { children, onAddMonitor }: Props = $props();
</script>

<div class="fixed left-0 top-0 h-screen w-[280px] bg-[#1e2228] border-r border-[#2d3139] overflow-y-auto flex flex-col">
	<div class="h-16 px-5 flex items-center gap-3 border-b border-[#2d3139]">
		<div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10b981] to-[#059669]"></div>
		<span class="text-xl font-bold text-[#e8eaed]">GeoProbe</span>
	</div>

	<button
		type="button"
		onclick={() => onAddMonitor?.()}
		class="mx-4 mt-4 px-5 py-3 bg-[#10b981] text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-150 hover:bg-[#0fd89e] hover:shadow-[0_4px_12px_rgba(16,185,129,0.3)] focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:ring-offset-2 focus:ring-offset-[#1e2228]"
	>
		<span class="text-lg">+</span>
		<span>Add New Monitor</span>
	</button>

	<div class="mx-4 mt-4 mb-4 relative">
		<span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] text-base">
			<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
		</span>
		<input
			type="text"
			placeholder="Search monitors..."
			class="w-full pl-10 pr-4 py-2.5 bg-[#2a2f38] border border-[#363b45] rounded-lg text-[#e8eaed] text-sm placeholder-[#6b7280] transition-all duration-150 focus:outline-none focus:border-[#10b981] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]"
		/>
	</div>

	<div class="flex-1">
		{@render children?.()}
	</div>
</div>
