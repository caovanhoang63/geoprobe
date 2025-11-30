import { json, type RequestHandler } from '@sveltejs/kit';
import { getMonitors, createMonitor, monitorFormSchema } from '$lib/server/monitors';
import { z } from 'zod';

export const GET: RequestHandler = async () => {
	try {
		const monitors = await getMonitors();
		return json({
			monitors,
			total: monitors.length
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to fetch monitors';
		return json({ error: message }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	let body: unknown;

	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}

	try {
		const validated = monitorFormSchema.parse(body);
		const monitor = await createMonitor(validated);
		return json({ monitor }, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return json(
				{
					error: 'Validation failed',
					details: error.issues
				},
				{ status: 400 }
			);
		}

		const message = error instanceof Error ? error.message : 'Failed to create monitor';
		return json({ error: message }, { status: 500 });
	}
};
