import type { PageServerLoad } from './$types';
import { getPublicMonitors } from '$lib/server/monitors';

export const load: PageServerLoad = async () => {
	const monitors = await getPublicMonitors();

	const overallStatus = monitors.length === 0
		? 'operational'
		: monitors.every((m) => m.latestStatus === 'up')
			? 'operational'
			: 'degraded';

	return {
		monitors,
		overallStatus,
		lastUpdated: new Date().toISOString()
	};
};
