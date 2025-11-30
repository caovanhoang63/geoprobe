import type { RequestHandler } from './$types';
import { monitorEvents } from '$lib/server/events';

interface SSEMonitorUpdate {
	type: 'monitor-update';
	data: {
		id: string;
		name: string;
		url: string;
		status: 'up' | 'down' | 'unknown';
		uptime24h: number;
	};
}

interface SSEMeasurementNew {
	type: 'measurement-new';
	data: {
		monitorId: string;
		location: string;
		status: string;
		latency: number;
		timestamp: string;
	};
}

interface SSEStatusChange {
	type: 'status-change';
	data: {
		monitorId: string;
		status: 'up' | 'down';
	};
}

type SSEEvent = SSEMonitorUpdate | SSEMeasurementNew | SSEStatusChange;

export const GET: RequestHandler = async () => {
	const encoder = new TextEncoder();
	let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
	let closed = false;
	let cleanup: (() => void) | null = null;

	const stream = new ReadableStream({
		start(controller) {
			const sendEvent = (event: SSEEvent): void => {
				if (closed) return;
				try {
					const message = `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`;
					controller.enqueue(encoder.encode(message));
				} catch {
					cleanup?.();
				}
			};

			const sendHeartbeat = (): void => {
				if (closed) return;
				try {
					controller.enqueue(encoder.encode(': heartbeat\n\n'));
				} catch {
					cleanup?.();
				}
			};

			const monitorUpdateListener = (data: SSEEvent['data']): void => {
				sendEvent({ type: 'monitor-update', data } as SSEMonitorUpdate);
			};

			const measurementNewListener = (data: SSEEvent['data']): void => {
				sendEvent({ type: 'measurement-new', data } as SSEMeasurementNew);
			};

			const statusChangeListener = (data: SSEEvent['data']): void => {
				sendEvent({ type: 'status-change', data } as SSEStatusChange);
			};

			monitorEvents.on('monitor-update', monitorUpdateListener);
			monitorEvents.on('measurement-new', measurementNewListener);
			monitorEvents.on('status-change', statusChangeListener);

			heartbeatInterval = setInterval(sendHeartbeat, 30000);

			cleanup = () => {
				if (closed) return;
				closed = true;
				if (heartbeatInterval) {
					clearInterval(heartbeatInterval);
					heartbeatInterval = null;
				}
				monitorEvents.off('monitor-update', monitorUpdateListener);
				monitorEvents.off('measurement-new', measurementNewListener);
				monitorEvents.off('status-change', statusChangeListener);
			};
		},

		cancel() {
			cleanup?.();
			console.log('[SSE] Client disconnected');
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};
