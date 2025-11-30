import { db } from './db';
import { measurements } from './schema';
import { runMeasurement } from './globalping';
import { monitorEvents } from './events';
import { checkAndAlert } from './alerts';
import type { Monitor, Measurement } from './schema';
import type { LocationFilter } from '$lib/types/globalping';
import { eq, desc, gte, and } from 'drizzle-orm';

export async function checkMonitor(monitor: Monitor): Promise<void> {
	const locations: LocationFilter[] = JSON.parse(monitor.locations);

	console.log(`[Checker] Starting check for ${monitor.name} (${monitor.url})`);

	const response = await runMeasurement({
		type: 'http',
		target: monitor.url,
		locations,
		options: { timeout: 10000 }
	});

	if (response.status === 'failed') {
		console.error(`[Checker] Measurement failed for ${monitor.name}`);
		return;
	}

	const results =
		response.results?.map((r) => ({
			monitorId: monitor.id,
			location: `${r.probe.city}, ${r.probe.country}`,
			country: r.probe.country,
			city: r.probe.city,
			networkType: r.probe.tags.includes('residential') ? 'residential' : 'datacenter',
			statusCode: r.result.statusCode ?? null,
			latency: r.result.timings?.total ?? 0,
			status: r.result.status === 'finished' ? 'success' : 'failed',
			errorMessage: r.result.rawError ?? null
		})) ?? [];

	if (results.length > 0) {
		const insertedMeasurements = await db.insert(measurements).values(results).returning();
		console.log(`[Checker] Stored ${results.length} measurements for ${monitor.name}`);

		for (const measurement of insertedMeasurements) {
			await checkAndAlert(monitor, measurement);

			monitorEvents.emitMeasurement({
				monitorId: monitor.id,
				location: measurement.location,
				status: measurement.status,
				latency: measurement.latency,
				timestamp: measurement.timestamp
			});
		}

		const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
		const last24hMeasurements = await db
			.select()
			.from(measurements)
			.where(and(eq(measurements.monitorId, monitor.id), gte(measurements.timestamp, oneDayAgo)));

		const successCount = last24hMeasurements.filter((m: Measurement) => m.status === 'success').length;
		const uptime24h = last24hMeasurements.length > 0
			? Math.round((successCount / last24hMeasurements.length) * 100)
			: 100;

		const latestMeasurement = results[0];
		const currentStatus = latestMeasurement?.status === 'success' ? 'up' : 'down';

		monitorEvents.emitMonitorUpdate({
			id: monitor.id,
			name: monitor.name,
			url: monitor.url,
			status: currentStatus,
			uptime24h
		});

		const previousMeasurements = await db
			.select()
			.from(measurements)
			.where(eq(measurements.monitorId, monitor.id))
			.orderBy(desc(measurements.timestamp))
			.limit(10);

		const recentStatuses = previousMeasurements.map((m) => m.status);
		const wasDown = recentStatuses[1] === 'failed';
		const isNowUp = currentStatus === 'up';
		const isNowDown = currentStatus === 'down';

		if ((wasDown && isNowUp) || (!wasDown && isNowDown)) {
			monitorEvents.emitStatusChange({
				monitorId: monitor.id,
				status: currentStatus
			});
		}
	}
}
