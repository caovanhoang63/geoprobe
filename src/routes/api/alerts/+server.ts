import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAlerts, getUnacknowledgedAlerts } from '$lib/server/alerts';

export const GET: RequestHandler = async ({ url }) => {
	const monitorId = url.searchParams.get('monitorId');
	const unacknowledgedOnly = url.searchParams.get('unacknowledged') === 'true';

	try {
		let alerts;

		if (unacknowledgedOnly) {
			alerts = await getUnacknowledgedAlerts();
		} else if (monitorId) {
			alerts = await getAlerts(monitorId);
		} else {
			alerts = await getAlerts();
		}

		return json({
			success: true,
			data: alerts,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to fetch alerts';
		return json(
			{
				success: false,
				error: message,
				timestamp: new Date().toISOString()
			},
			{ status: 500 }
		);
	}
};
