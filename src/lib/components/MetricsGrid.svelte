<script lang="ts">
	import MetricCard from './MetricCard.svelte';

	interface Props {
		currentResponse: number;
		avgResponse24h: number;
		uptime24h: number;
		uptime30d: number;
		certExpiry: number | null;
		certUrl?: string;
	}

	const { currentResponse, avgResponse24h, uptime24h, uptime30d, certExpiry, certUrl }: Props = $props();

	const responseStatus = $derived(() => {
		if (currentResponse > 1000) return 'danger';
		if (currentResponse > 500) return 'warning';
		return 'normal';
	});

	const avgResponseStatus = $derived(() => {
		if (avgResponse24h > 1000) return 'danger';
		if (avgResponse24h > 500) return 'warning';
		return 'normal';
	});

	const uptimeStatus = $derived((value: number) => {
		if (value < 95) return 'danger';
		if (value < 99) return 'warning';
		return 'normal';
	});

	const certStatus = $derived(() => {
		if (certExpiry === null) return 'normal';
		if (certExpiry < 7) return 'danger';
		if (certExpiry < 30) return 'warning';
		return 'normal';
	});
</script>

<div class="grid grid-cols-5 gap-6 max-[1400px]:grid-cols-3 max-[1024px]:grid-cols-2">
	<MetricCard
		label="Response Time"
		sublabel="Current"
		value={currentResponse}
		type="duration"
		status={responseStatus()}
	/>
	<MetricCard
		label="24h Average"
		sublabel="Response Time"
		value={avgResponse24h}
		type="duration"
		status={avgResponseStatus()}
	/>
	<MetricCard
		label="Uptime 24h"
		value={uptime24h}
		type="percentage"
		status={uptimeStatus(uptime24h)}
	/>
	<MetricCard
		label="Uptime 30d"
		value={uptime30d}
		type="percentage"
		status={uptimeStatus(uptime30d)}
	/>
	{#if certExpiry !== null}
		<MetricCard
			label="Cert Expiry"
			sublabel="SSL Certificate"
			value={certExpiry}
			type={certUrl ? 'link' : 'text'}
			status={certStatus()}
			href={certUrl}
		/>
	{:else}
		<MetricCard
			label="Cert Expiry"
			sublabel="SSL Certificate"
			value="N/A"
			type="text"
			status="normal"
		/>
	{/if}
</div>
