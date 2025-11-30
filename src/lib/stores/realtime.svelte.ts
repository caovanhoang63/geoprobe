interface MonitorUpdate {
	id: string;
	name: string;
	url: string;
	status: 'up' | 'down' | 'unknown';
	uptime24h: number;
}

interface MeasurementNew {
	monitorId: string;
	location: string;
	status: string;
	latency: number;
	timestamp: string;
}

interface StatusChange {
	monitorId: string;
	status: 'up' | 'down';
}

export function createRealtimeStore() {
	let connected = $state(false);
	let eventSource: EventSource | null = null;
	let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

	const monitorUpdates = $state<Map<string, MonitorUpdate>>(new Map());
	const latestMeasurements = $state<Map<string, MeasurementNew[]>>(new Map());
	const statusChanges = $state<Map<string, StatusChange>>(new Map());

	function connect(): void {
		if (eventSource) {
			console.log('[Realtime] Already connected');
			return;
		}

		console.log('[Realtime] Connecting to SSE...');
		eventSource = new EventSource('/api/events');

		eventSource.addEventListener('monitor-update', (e: MessageEvent) => {
			const data = JSON.parse(e.data) as MonitorUpdate;
			monitorUpdates.set(data.id, data);
			console.log('[Realtime] Monitor update:', data);
		});

		eventSource.addEventListener('measurement-new', (e: MessageEvent) => {
			const data = JSON.parse(e.data) as MeasurementNew;
			const existing = latestMeasurements.get(data.monitorId) ?? [];
			latestMeasurements.set(data.monitorId, [data, ...existing].slice(0, 100));
			console.log('[Realtime] New measurement:', data);
		});

		eventSource.addEventListener('status-change', (e: MessageEvent) => {
			const data = JSON.parse(e.data) as StatusChange;
			statusChanges.set(data.monitorId, data);
			console.log('[Realtime] Status change:', data);
		});

		eventSource.onopen = () => {
			connected = true;
			console.log('[Realtime] Connected');
			if (reconnectTimeout) {
				clearTimeout(reconnectTimeout);
				reconnectTimeout = null;
			}
		};

		eventSource.onerror = (error: Event) => {
			console.error('[Realtime] Connection error:', error);
			connected = false;
			eventSource?.close();
			eventSource = null;

			if (!reconnectTimeout) {
				reconnectTimeout = setTimeout(() => {
					console.log('[Realtime] Attempting reconnect...');
					connect();
				}, 5000);
			}
		};
	}

	function disconnect(): void {
		if (reconnectTimeout) {
			clearTimeout(reconnectTimeout);
			reconnectTimeout = null;
		}
		if (eventSource) {
			eventSource.close();
			eventSource = null;
		}
		connected = false;
		console.log('[Realtime] Disconnected');
	}

	function getMonitorUpdate(monitorId: string): MonitorUpdate | undefined {
		return monitorUpdates.get(monitorId);
	}

	function getMeasurements(monitorId: string): MeasurementNew[] {
		return latestMeasurements.get(monitorId) ?? [];
	}

	function getStatusChange(monitorId: string): StatusChange | undefined {
		return statusChanges.get(monitorId);
	}

	return {
		get connected() {
			return connected;
		},
		connect,
		disconnect,
		getMonitorUpdate,
		getMeasurements,
		getStatusChange
	};
}
