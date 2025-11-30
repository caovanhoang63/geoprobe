<script lang="ts">
	type MetricType = 'text' | 'link' | 'percentage' | 'duration';
	type MetricStatus = 'normal' | 'warning' | 'danger';

	interface Props {
		label: string;
		sublabel?: string;
		value: string | number;
		type: MetricType;
		status?: MetricStatus;
		large?: boolean;
		href?: string;
	}

	const { label, sublabel, value, type, status = 'normal', large = false, href }: Props = $props();

	const formattedValue = $derived(() => {
		if (type === 'percentage') return `${value}%`;
		if (type === 'duration') return `${value}ms`;
		return String(value);
	});

	const valueColorClass = $derived(() => {
		if (type === 'link') return 'text-[#10b981] underline cursor-pointer';
		if (status === 'warning') return 'text-[#f59e0b]';
		if (status === 'danger') return 'text-[#ef4444]';
		return 'text-[#e8eaed]';
	});
</script>

<div class="flex flex-col">
	<span class="text-[13px] text-[#9ca3af] font-medium">{label}</span>
	{#if sublabel}
		<span class="text-[11px] text-[#6b7280]">{sublabel}</span>
	{/if}
	{#if type === 'link' && href}
		<a
			{href}
			target="_blank"
			rel="noopener noreferrer"
			class="text-[#10b981] underline cursor-pointer font-semibold transition-opacity hover:opacity-80 {large ? 'text-[20px]' : 'text-[16px]'}"
		>
			{formattedValue()}
		</a>
	{:else}
		<span class="{valueColorClass()} font-semibold {large ? 'text-[20px]' : 'text-[16px]'}">
			{formattedValue()}
		</span>
	{/if}
</div>
