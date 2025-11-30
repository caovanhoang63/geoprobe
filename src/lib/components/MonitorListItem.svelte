<script lang="ts">
	interface Monitor {
		id: string;
		name: string;
		status: 'up' | 'down';
		uptimePercentage: number;
	}

	interface Props {
		monitor: Monitor;
		active: boolean;
		onclick: () => void;
	}

	const { monitor, active, onclick }: Props = $props();
</script>

<button
	onclick={onclick}
	class="w-full px-4 py-3 flex items-center gap-3 border-b border-[#2d3139] transition-all duration-150 hover:bg-[#2a2f38] {active
		? 'bg-[#2a2f38] border-l-[3px] border-l-[#10b981]'
		: ''}"
>
	<div
		class="min-w-[48px] h-6 px-2.5 rounded-full flex items-center justify-center text-[11px] font-semibold text-white {monitor.status ===
		'up'
			? 'bg-[#10b981]'
			: 'bg-[#ef4444]'}"
	>
		{monitor.status === 'up' ? 'Up' : 'Down'} {monitor.uptimePercentage}%
	</div>
	<span class="flex-1 text-left text-sm text-[#e8eaed] truncate">{monitor.name}</span>
</button>
