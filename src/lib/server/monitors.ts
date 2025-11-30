import { db } from './db';
import { monitors, measurements, type Monitor, type Measurement } from './schema';
import { eq, desc, gte, and, sql } from 'drizzle-orm';
import { z } from 'zod';

const locationSchema = z.object({
	location: z.object({
		id: z.string(),
		name: z.string(),
		code: z.string(),
		type: z.enum(['continent', 'country', 'city']),
		parentId: z.string().optional(),
		networkTypes: z.array(z.enum(['residential', 'datacenter'])),
		isps: z.array(z.string()).optional(),
		probeCount: z.number().optional()
	}),
	networkType: z.enum(['residential', 'datacenter', 'any']),
	isp: z.string().optional(),
	color: z.string()
});

export const monitorFormSchema = z.object({
	name: z.string().min(2).max(100),
	url: z.string().url(),
	interval: z.number().int().min(60).max(3600),
	locations: z.array(locationSchema).min(1),
	discordWebhook: z.string().url().optional().or(z.literal(''))
});

export type MonitorFormData = z.infer<typeof monitorFormSchema>;

export interface MonitorWithStatus extends Monitor {
	latestStatus: 'up' | 'down' | 'unknown';
	uptime24h: number;
	uptime30d?: number;
	avgLatency?: number;
}

export interface MonitorWithMeasurements {
	monitor: Monitor;
	measurements: Measurement[];
	uptime24h: number;
	uptime30d: number;
}

function calculateUptime(measurements: Measurement[]): number {
	if (measurements.length === 0) return 0;

	const successful = measurements.filter((m) => m.status === 'success').length;
	return Math.round((successful / measurements.length) * 100);
}

function getTimestamp24HoursAgo(): string {
	const date = new Date();
	date.setHours(date.getHours() - 24);
	return date.toISOString();
}

function getTimestamp30DaysAgo(): string {
	const date = new Date();
	date.setDate(date.getDate() - 30);
	return date.toISOString();
}

export async function getMonitors(): Promise<MonitorWithStatus[]> {
	const allMonitors = await db.select().from(monitors);

	const monitorsWithStatus = await Promise.all(
		allMonitors.map(async (monitor) => {
			const timestamp24h = getTimestamp24HoursAgo();

			const recentMeasurements = await db
				.select()
				.from(measurements)
				.where(
					and(eq(measurements.monitorId, monitor.id), gte(measurements.timestamp, timestamp24h))
				)
				.orderBy(desc(measurements.timestamp));

			const latestMeasurement = recentMeasurements[0];
			const latestStatus: 'up' | 'down' | 'unknown' = latestMeasurement
				? latestMeasurement.status === 'success'
					? 'up'
					: 'down'
				: 'unknown';

			const uptime24h = calculateUptime(recentMeasurements);

			return {
				...monitor,
				latestStatus,
				uptime24h
			};
		})
	);

	return monitorsWithStatus;
}

export async function getPublicMonitors(): Promise<MonitorWithStatus[]> {
	const publicMonitors = await db.select().from(monitors).where(eq(monitors.public, true));

	const monitorsWithStatus = await Promise.all(
		publicMonitors.map(async (monitor) => {
			const timestamp24h = getTimestamp24HoursAgo();
			const timestamp30d = getTimestamp30DaysAgo();

			const recentMeasurements = await db
				.select()
				.from(measurements)
				.where(
					and(eq(measurements.monitorId, monitor.id), gte(measurements.timestamp, timestamp24h))
				)
				.orderBy(desc(measurements.timestamp));

			const measurements30d = await db
				.select()
				.from(measurements)
				.where(and(eq(measurements.monitorId, monitor.id), gte(measurements.timestamp, timestamp30d)))
				.orderBy(desc(measurements.timestamp));

			const latestMeasurement = recentMeasurements[0];
			const latestStatus: 'up' | 'down' | 'unknown' = latestMeasurement
				? latestMeasurement.status === 'success'
					? 'up'
					: 'down'
				: 'unknown';

			const uptime24h = calculateUptime(recentMeasurements);

			return {
				...monitor,
				latestStatus,
				uptime24h,
				uptime30d: calculateUptime(measurements30d),
				avgLatency: recentMeasurements.length > 0
					? Math.round(recentMeasurements.reduce((sum, m) => sum + m.latency, 0) / recentMeasurements.length)
					: 0
			};
		})
	);

	return monitorsWithStatus;
}

export async function getMonitorById(id: string): Promise<MonitorWithMeasurements | null> {
	const monitor = await db.select().from(monitors).where(eq(monitors.id, id)).limit(1);

	if (monitor.length === 0 || !monitor[0]) {
		return null;
	}

	const timestamp24h = getTimestamp24HoursAgo();
	const timestamp30d = getTimestamp30DaysAgo();

	const measurements24h = await db
		.select()
		.from(measurements)
		.where(and(eq(measurements.monitorId, id), gte(measurements.timestamp, timestamp24h)))
		.orderBy(desc(measurements.timestamp));

	const measurements30d = await db
		.select()
		.from(measurements)
		.where(and(eq(measurements.monitorId, id), gte(measurements.timestamp, timestamp30d)))
		.orderBy(desc(measurements.timestamp));

	return {
		monitor: monitor[0],
		measurements: measurements24h,
		uptime24h: calculateUptime(measurements24h),
		uptime30d: calculateUptime(measurements30d)
	};
}

export async function createMonitor(data: MonitorFormData): Promise<Monitor> {
	const validated = monitorFormSchema.parse(data);

	const newMonitor = await db
		.insert(monitors)
		.values({
			name: validated.name,
			url: validated.url,
			interval: validated.interval,
			locations: JSON.stringify(validated.locations),
			active: true
		})
		.returning();

	if (!newMonitor[0]) {
		throw new Error('Failed to create monitor');
	}

	return newMonitor[0];
}

export async function updateMonitor(id: string, data: MonitorFormData): Promise<Monitor> {
	const validated = monitorFormSchema.parse(data);

	const updated = await db
		.update(monitors)
		.set({
			name: validated.name,
			url: validated.url,
			interval: validated.interval,
			locations: JSON.stringify(validated.locations),
			updatedAt: new Date().toISOString()
		})
		.where(eq(monitors.id, id))
		.returning();

	if (updated.length === 0 || !updated[0]) {
		throw new Error('Monitor not found');
	}

	return updated[0];
}

export async function deleteMonitor(id: string): Promise<void> {
	await db.delete(monitors).where(eq(monitors.id, id));
}

export async function toggleMonitorActive(id: string): Promise<Monitor> {
	const monitor = await db.select().from(monitors).where(eq(monitors.id, id)).limit(1);

	if (monitor.length === 0 || !monitor[0]) {
		throw new Error('Monitor not found');
	}

	const updated = await db
		.update(monitors)
		.set({
			active: !monitor[0].active,
			updatedAt: new Date().toISOString()
		})
		.where(eq(monitors.id, id))
		.returning();

	if (!updated[0]) {
		throw new Error('Failed to update monitor');
	}

	return updated[0];
}
