import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { monitors } from '$lib/server/schema';
import { checkMonitor } from '$lib/server/checker';

export const POST: RequestHandler = async () => {
	const [monitor] = await db.select().from(monitors).limit(1);

	if (!monitor) {
		return json({ error: 'No monitors found' }, { status: 404 });
	}

	try {
		await checkMonitor(monitor);
		return json({ success: true, monitorId: monitor.id });
	} catch (error) {
		console.error('[API] Test check failed:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
};
