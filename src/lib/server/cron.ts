import cron, { type ScheduledTask } from 'node-cron';
import { db } from './db';
import { monitors } from './schema';
import { eq } from 'drizzle-orm';
import { checkMonitor } from './checker';

let cronJob: ScheduledTask | null = null;

async function runAllChecks(): Promise<void> {
	const startTime = Date.now();
	console.log('[Cron] Starting monitor checks...');

	try {
		const activeMonitors = await db.select().from(monitors).where(eq(monitors.active, true));

		console.log(`[Cron] Found ${activeMonitors.length} active monitors`);

		let successCount = 0;
		let errorCount = 0;

		for (const monitor of activeMonitors) {
			try {
				await checkMonitor(monitor);
				successCount++;
			} catch (error) {
				errorCount++;
				console.error(`[Cron] Failed to check ${monitor.name}:`, error);
			}
		}

		const duration = Date.now() - startTime;
		console.log(
			`[Cron] Completed in ${duration}ms - Success: ${successCount}, Errors: ${errorCount}`
		);
	} catch (error) {
		console.error('[Cron] Fatal error in runAllChecks:', error);
	}
}

export function initializeCron(): void {
	if (cronJob) {
		console.log('[Cron] Already initialized, skipping...');
		return;
	}

	cronJob = cron.schedule('*/5 * * * *', runAllChecks);

	console.log('[Cron] Scheduler initialized - checks every 5 minutes');
}

export function stopCron(): void {
	if (cronJob) {
		cronJob.stop();
		cronJob = null;
		console.log('[Cron] Scheduler stopped');
	}
}