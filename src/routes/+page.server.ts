import type { PageServerLoad } from './$types';
import { getMonitors } from '$lib/server/monitors';
import { db } from '$lib/server/db';
import { measurements } from '$lib/server/schema';
import { eq, desc, gte, and } from 'drizzle-orm';

function getTimestamp30HoursAgo(): string {
	const date = new Date();
	date.setHours(date.getHours() - 30);
	return date.toISOString();
}

function getTimestamp30DaysAgo(): string {
	const date = new Date();
	date.setDate(date.getDate() - 30);
	return date.toISOString();
}

export const load: PageServerLoad = async () => {
	const allMonitors = await getMonitors();

	const monitorsWithMeasurements = await Promise.all(
		allMonitors.map(async (monitor) => {
			const timestamp30h = getTimestamp30HoursAgo();
			const timestamp30d = getTimestamp30DaysAgo();

			const recentMeasurements = await db
				.select()
				.from(measurements)
				.where(and(eq(measurements.monitorId, monitor.id), gte(measurements.timestamp, timestamp30h)))
				.orderBy(desc(measurements.timestamp));

			const measurements30d = await db
				.select()
				.from(measurements)
				.where(and(eq(measurements.monitorId, monitor.id), gte(measurements.timestamp, timestamp30d)))
				.orderBy(desc(measurements.timestamp));

			const successCount30d = measurements30d.filter((m) => m.status === 'success').length;
			const uptime30d = measurements30d.length > 0
				? Math.round((successCount30d / measurements30d.length) * 100 * 10) / 10
				: 100;

			const avgLatency = recentMeasurements.length > 0
				? Math.round(recentMeasurements.reduce((sum, m) => sum + m.latency, 0) / recentMeasurements.length)
				: 0;

			const latestMeasurement = recentMeasurements[0];

			return {
				...monitor,
				measurements: recentMeasurements.map((m) => ({
					id: m.id,
					location: m.location,
					latency: m.latency,
					status: m.status,
					timestamp: m.timestamp
				})),
				uptime30d,
				avgLatency,
				currentLatency: latestMeasurement?.latency ?? 0
			};
		})
	);

	return {
		monitors: monitorsWithMeasurements
	};
};
