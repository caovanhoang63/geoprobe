import { db } from './db';
import { measurements } from './schema';
import { runMeasurement } from './globalping';
import type { Monitor } from './schema';
import type { LocationFilter } from '$lib/types/globalping';

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
		await db.insert(measurements).values(results);
		console.log(`[Checker] Stored ${results.length} measurements for ${monitor.name}`);
	}
}
