import { EventEmitter } from 'node:events';

interface MonitorUpdateEvent {
	id: string;
	name: string;
	url: string;
	status: 'up' | 'down' | 'unknown';
	uptime24h: number;
}

interface MeasurementNewEvent {
	monitorId: string;
	location: string;
	status: string;
	latency: number;
	timestamp: string;
}

interface StatusChangeEvent {
	monitorId: string;
	status: 'up' | 'down';
}

class MonitorEventEmitter extends EventEmitter {
	emitMonitorUpdate(data: MonitorUpdateEvent): void {
		this.emit('monitor-update', data);
		console.log(`[Events] Emitted monitor-update for ${data.id}`);
	}

	emitMeasurement(data: MeasurementNewEvent): void {
		this.emit('measurement-new', data);
		console.log(`[Events] Emitted measurement-new for ${data.monitorId}`);
	}

	emitStatusChange(data: StatusChangeEvent): void {
		this.emit('status-change', data);
		console.log(`[Events] Emitted status-change for ${data.monitorId}: ${data.status}`);
	}
}

export const monitorEvents = new MonitorEventEmitter();
