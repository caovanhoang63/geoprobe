import { db } from './db';
import { alerts, measurements } from './schema';
import type { Monitor, Measurement, Alert, NewAlert } from './schema';
import { eq, and, desc, gte } from 'drizzle-orm';

const ALERT_DEBOUNCE_MS = 5 * 60 * 1000;
const CONSECUTIVE_FAILURES_THRESHOLD = 3;
const LATENCY_THRESHOLD_MS = 1000;

interface DiscordEmbed {
	title: string;
	description: string;
	color: number;
	timestamp: string;
}

interface DiscordPayload {
	embeds: DiscordEmbed[];
}

export async function checkAndAlert(monitor: Monitor, measurement: Measurement): Promise<void> {
	if (!monitor.discordWebhook) {
		return;
	}

	const recentAlerts = await getRecentAlerts(monitor.id, ALERT_DEBOUNCE_MS);
	const recentMeasurements = await getRecentMeasurements(monitor.id, 5);

	if (measurement.status === 'failed') {
		await handleFailure(monitor, measurement, recentMeasurements, recentAlerts);
	} else if (measurement.status === 'success') {
		await handleSuccess(monitor, measurement, recentMeasurements, recentAlerts);
		await handleLatencySpike(monitor, measurement, recentAlerts);
	}
}

async function handleFailure(
	monitor: Monitor,
	measurement: Measurement,
	recentMeasurements: Measurement[],
	recentAlerts: Alert[]
): Promise<void> {
	const consecutiveFailures = countConsecutiveFailures(recentMeasurements);

	if (consecutiveFailures >= CONSECUTIVE_FAILURES_THRESHOLD) {
		const hasRecentDownAlert = recentAlerts.some((alert) => alert.type === 'down');

		if (!hasRecentDownAlert) {
			const message = `Monitor "${monitor.name}" is DOWN\nURL: ${monitor.url}\nLocation: ${measurement.location}\nError: ${measurement.errorMessage ?? 'Unknown error'}\nConsecutive failures: ${consecutiveFailures}`;

			await createAndSendAlert(monitor, 'down', message, 0xef4444);
		}
	}
}

async function handleSuccess(
	monitor: Monitor,
	measurement: Measurement,
	recentMeasurements: Measurement[],
	recentAlerts: Alert[]
): Promise<void> {
	const previousMeasurement = recentMeasurements[1];

	if (previousMeasurement?.status === 'failed') {
		const wasDown = recentMeasurements
			.slice(1, CONSECUTIVE_FAILURES_THRESHOLD + 1)
			.every((m) => m.status === 'failed');

		if (wasDown) {
			const hasRecentUpAlert = recentAlerts.some((alert) => alert.type === 'up');

			if (!hasRecentUpAlert) {
				const message = `Monitor "${monitor.name}" is BACK UP\nURL: ${monitor.url}\nLocation: ${measurement.location}\nLatency: ${measurement.latency}ms`;

				await createAndSendAlert(monitor, 'up', message, 0x10b981);
			}
		}
	}
}

async function handleLatencySpike(
	monitor: Monitor,
	measurement: Measurement,
	recentAlerts: Alert[]
): Promise<void> {
	if (measurement.latency > LATENCY_THRESHOLD_MS) {
		const hasRecentLatencyAlert = recentAlerts.some((alert) => alert.type === 'latency_spike');

		if (!hasRecentLatencyAlert) {
			const message = `High latency detected for "${monitor.name}"\nURL: ${monitor.url}\nLocation: ${measurement.location}\nLatency: ${measurement.latency}ms (threshold: ${LATENCY_THRESHOLD_MS}ms)`;

			await createAndSendAlert(monitor, 'latency_spike', message, 0xf59e0b);
		}
	}
}

async function createAndSendAlert(
	monitor: Monitor,
	type: string,
	message: string,
	color: number
): Promise<void> {
	const alert: NewAlert = {
		monitorId: monitor.id,
		type,
		message,
		acknowledged: false
	};

	const [createdAlert] = await db.insert(alerts).values(alert).returning();

	if (monitor.discordWebhook && createdAlert) {
		await sendDiscordAlert(monitor.discordWebhook, createdAlert, color);
	}

	console.log(`[Alert] Created ${type} alert for ${monitor.name}`);
}

export async function sendDiscordAlert(
	webhookUrl: string,
	alert: Alert,
	color: number
): Promise<void> {
	const emoji = getAlertEmoji(alert.type);
	const title = `${emoji} ${alert.type.toUpperCase().replace('_', ' ')}`;

	const payload: DiscordPayload = {
		embeds: [
			{
				title,
				description: alert.message,
				color,
				timestamp: alert.createdAt
			}
		]
	};

	try {
		const response = await fetch(webhookUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});

		if (!response.ok) {
			console.error(`[Alert] Discord webhook failed: ${response.statusText}`);
		}
	} catch (error) {
		console.error('[Alert] Failed to send Discord webhook:', error);
	}
}

export async function getAlerts(monitorId?: string): Promise<Alert[]> {
	if (monitorId) {
		return db.select().from(alerts).where(eq(alerts.monitorId, monitorId)).orderBy(desc(alerts.createdAt));
	}

	return db.select().from(alerts).orderBy(desc(alerts.createdAt));
}

export async function getUnacknowledgedAlerts(): Promise<Alert[]> {
	return db.select().from(alerts).where(eq(alerts.acknowledged, false)).orderBy(desc(alerts.createdAt));
}

export async function acknowledgeAlert(alertId: string): Promise<void> {
	await db.update(alerts).set({ acknowledged: true }).where(eq(alerts.id, alertId));
}

async function getRecentAlerts(monitorId: string, windowMs: number): Promise<Alert[]> {
	const cutoffTime = new Date(Date.now() - windowMs).toISOString();

	return db
		.select()
		.from(alerts)
		.where(and(eq(alerts.monitorId, monitorId), gte(alerts.createdAt, cutoffTime)))
		.orderBy(desc(alerts.createdAt));
}

async function getRecentMeasurements(monitorId: string, limit: number): Promise<Measurement[]> {
	return db
		.select()
		.from(measurements)
		.where(eq(measurements.monitorId, monitorId))
		.orderBy(desc(measurements.timestamp))
		.limit(limit);
}

function countConsecutiveFailures(measurements: Measurement[]): number {
	let count = 0;

	for (const measurement of measurements) {
		if (measurement.status === 'failed') {
			count++;
		} else {
			break;
		}
	}

	return count;
}

function getAlertEmoji(type: string): string {
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
