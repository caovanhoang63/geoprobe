<script lang="ts">
	interface Props {
		status: 'operational' | 'degraded';
		lastUpdated: string;
	}

	const { status, lastUpdated }: Props = $props();

	function formatTimeDifference(isoString: string): string {
		const now = new Date();
		const updated = new Date(isoString);
		const diffMs = now.getTime() - updated.getTime();
		const diffMins = Math.floor(diffMs / 60000);

		if (diffMins < 1) return 'just now';
		if (diffMins === 1) return '1 minute ago';
		if (diffMins < 60) return `${diffMins} minutes ago`;

		const diffHours = Math.floor(diffMins / 60);
		if (diffHours === 1) return '1 hour ago';
		if (diffHours < 24) return `${diffHours} hours ago`;

		const diffDays = Math.floor(diffHours / 24);
		if (diffDays === 1) return '1 day ago';
		return `${diffDays} days ago`;
	}

	const statusColor = $derived(status === 'operational' ? '#10b981' : '#f59e0b');
	const statusIcon = $derived(status === 'operational' ? '🟢' : '🟡');
	const statusText = $derived(status === 'operational' ? 'All Systems Operational' : 'Degraded Performance');
	const timeAgo = $derived(formatTimeDifference(lastUpdated));
</script>

<div class="rounded-lg p-6 mb-6" style="background-color: {statusColor}15; border: 2px solid {statusColor};">
	<div class="flex items-center gap-3 mb-2">
		<span class="text-3xl">{statusIcon}</span>
		<h1 class="text-2xl font-bold" style="color: {statusColor};">{statusText}</h1>
	</div>
	<p class="text-sm text-slate-400 ml-11">Last updated {timeAgo}</p>
</div>
