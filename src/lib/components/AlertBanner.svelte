<script lang="ts">
	import type { Alert } from '$lib/server/schema';

	interface Props {
		alerts: Alert[];
		onAcknowledge?: (alertId: string) => void;
	}

	const { alerts, onAcknowledge }: Props = $props();

	let visibleAlerts = $state<Set<string>>(new Set(alerts.map((a) => a.id)));
	let acknowledging = $state<Set<string>>(new Set());

	async function handleAcknowledge(alertId: string): Promise<void> {
		acknowledging.add(alertId);

		try {
			const response = await fetch(`/api/alerts/${alertId}/acknowledge`, {
				method: 'POST'
			});

			if (!response.ok) {
				throw new Error('Failed to acknowledge alert');
			}

			visibleAlerts.delete(alertId);
			onAcknowledge?.(alertId);
		} catch (error) {
			console.error('Failed to acknowledge alert:', error);
		} finally {
			acknowledging.delete(alertId);
		}
	}

	function handleDismiss(alertId: string): void {
		visibleAlerts.delete(alertId);
	}

	function getAlertColor(type: string): string {
		switch (type) {
			case 'down':
				return 'bg-red-500/10 border-red-500';
			case 'up':
				return 'bg-emerald-500/10 border-emerald-500';
			case 'latency_spike':
				return 'bg-amber-500/10 border-amber-500';
			default:
				return 'bg-blue-500/10 border-blue-500';
		}
	}

	function getAlertIcon(type: string): string {
		switch (type) {
			case 'down':
				return '🔴';
			case 'up':
				return '🟢';
			case 'latency_spike':
				return '⚠️';
			case 'cert_expiring':
				return '📜';
			default:
				return '🔔';
		}
	}

	const visibleAlertsList = $derived(
		alerts.filter((alert) => visibleAlerts.has(alert.id))
	);
</script>

{#if visibleAlertsList.length > 0}
	<div class="space-y-2">
		{#each visibleAlertsList as alert (alert.id)}
			<div
				class="flex items-start gap-3 rounded-lg border-l-4 p-4 transition-colors {getAlertColor(
					alert.type
				)}"
			>
				<span class="text-2xl">{getAlertIcon(alert.type)}</span>

				<div class="flex-1">
					<p class="whitespace-pre-line text-sm text-slate-200">{alert.message}</p>
					<p class="mt-1 text-xs text-slate-400">
						{new Date(alert.createdAt).toLocaleString()}
					</p>
				</div>

				<div class="flex gap-2">
					<button
						onclick={() => handleAcknowledge(alert.id)}
						disabled={acknowledging.has(alert.id)}
						class="rounded px-3 py-1 text-xs text-slate-300 transition-colors hover:bg-slate-700 disabled:opacity-50"
					>
						{acknowledging.has(alert.id) ? 'Acknowledging...' : 'Acknowledge'}
					</button>

					<button
						onclick={() => handleDismiss(alert.id)}
						class="rounded px-2 py-1 text-xs text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200"
					>
						✕
					</button>
				</div>
			</div>
		{/each}
	</div>
{/if}
