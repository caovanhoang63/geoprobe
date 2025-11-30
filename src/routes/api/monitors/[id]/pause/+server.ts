import { json, type RequestHandler } from '@sveltejs/kit';
import { toggleMonitorActive } from '$lib/server/monitors';

export const POST: RequestHandler = async ({ params }) => {
	const id = params.id;

	if (!id) {
		return json({ error: 'Monitor ID is required' }, { status: 400 });
	}

	try {
		const monitor = await toggleMonitorActive(id);
		return json({ monitor });
	} catch (error) {
		if (error instanceof Error && error.message === 'Monitor not found') {
			return json({ error: error.message }, { status: 404 });
		}

		const message = error instanceof Error ? error.message : 'Failed to toggle monitor status';
		return json({ error: message }, { status: 500 });
	}
};
