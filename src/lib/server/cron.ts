import cron, { type ScheduledTask } from 'node-cron';
import { db } from './db';
import { monitors, type Monitor } from './schema';
import { eq } from 'drizzle-orm';
import { checkMonitor } from './checker';

let cronJob: ScheduledTask | null = null;

const activeChecks = new Set<string>();
const MAX_CONCURRENT_CHECKS = 10;

function isMonitorDueForCheck(monitor: Monitor): boolean {
	if (activeChecks.has(monitor.id)) {
		return false;
	}

	if (!monitor.lastCheckedAt) {
		return true;
	}

	const lastChecked = new Date(monitor.lastCheckedAt).getTime();
	const now = Date.now();

	if (lastChecked > now) {
		console.warn(`[Cron] Clock skew detected for ${monitor.name}, resetting lastCheckedAt`);
		return true;
	}

	const intervalMs = monitor.interval * 1000;
	return now - lastChecked >= intervalMs;
}

async function updateLastCheckedAt(monitorId: string): Promise<void> {
	await db
		.update(monitors)
		.set({ lastCheckedAt: new Date().toISOString() })
		.where(eq(monitors.id, monitorId));
}

async function checkMonitorWithLock(monitor: Monitor): Promise<boolean> {
	if (activeChecks.has(monitor.id)) {
		return false;
	}

	activeChecks.add(monitor.id);
	await updateLastCheckedAt(monitor.id);

	try {
		await checkMonitor(monitor);
		console.log(`[Cron] Checked ${monitor.name} (interval: ${monitor.interval}s)`);
		return true;
	} catch (error) {
		console.error(`[Cron] Failed to check ${monitor.name}:`, error);
		return false;
	} finally {
		activeChecks.delete(monitor.id);
	}
}

async function runScheduledChecks(): Promise<void> {
	const startTime = Date.now();
	console.log('[Cron] Tick - checking for due monitors...');

	try {
		const activeMonitors = await db.select().from(monitors).where(eq(monitors.active, true));
		const dueMonitors = activeMonitors.filter(isMonitorDueForCheck);

		if (dueMonitors.length === 0) {
			console.log('[Cron] No monitors due for check');
			return;
		}

		const availableSlots = MAX_CONCURRENT_CHECKS - activeChecks.size;
		const monitorsToCheck = dueMonitors.slice(0, availableSlots);

		console.log(`[Cron] ${monitorsToCheck.length}/${dueMonitors.length} monitors to check (${activeChecks.size} in progress)`);

		const results = await Promise.all(
			monitorsToCheck.map((monitor) => checkMonitorWithLock(monitor))
		);

		const successCount = results.filter(Boolean).length;
		const errorCount = results.filter((r) => !r).length;

		const duration = Date.now() - startTime;
		console.log(
			`[Cron] Completed in ${duration}ms - Success: ${successCount}, Errors: ${errorCount}`
		);
	} catch (error) {
		console.error('[Cron] Fatal error in runScheduledChecks:', error);
	}
}

export function initializeCron(): void {
	if (cronJob) {
		console.log('[Cron] Already initialized, skipping...');
		return;
	}

	cronJob = cron.schedule('*/1 * * * *', runScheduledChecks);

	console.log('[Cron] Scheduler initialized - tick every 1 minute, monitors checked per interval');
}

export function stopCron(): void {
	if (cronJob) {
		cronJob.stop();
		cronJob = null;
		console.log('[Cron] Scheduler stopped');
	}
}