import { json, type RequestHandler } from '@sveltejs/kit';
import {
	getMonitorById,
	updateMonitor,
	deleteMonitor,
	monitorFormSchema
} from '$lib/server/monitors';
import { z } from 'zod';

export const GET: RequestHandler = async ({ params }) => {
	const id = params.id;

	if (!id) {
		return json({ error: 'Monitor ID is required' }, { status: 400 });
	}

	try {
		const result = await getMonitorById(id);

		if (!result) {
			return json({ error: 'Monitor not found' }, { status: 404 });
		}

		return json(result);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to fetch monitor';
		return json({ error: message }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const id = params.id;

	if (!id) {
		return json({ error: 'Monitor ID is required' }, { status: 400 });
	}

	let body: unknown;

	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}

	try {
		const validated = monitorFormSchema.parse(body);
		const monitor = await updateMonitor(id, validated);
		return json({ monitor });
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

		if (error instanceof Error && error.message === 'Monitor not found') {
			return json({ error: error.message }, { status: 404 });
		}

		const message = error instanceof Error ? error.message : 'Failed to update monitor';
		return json({ error: message }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	const id = params.id;

	if (!id) {
		return json({ error: 'Monitor ID is required' }, { status: 400 });
	}

	try {
		await deleteMonitor(id);
		return json({ success: true }, { status: 200 });
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to delete monitor';
		return json({ error: message }, { status: 500 });
	}
};
