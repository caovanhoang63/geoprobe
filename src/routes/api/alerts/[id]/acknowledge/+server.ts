import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { acknowledgeAlert } from '$lib/server/alerts';

export const POST: RequestHandler = async ({ params }) => {
	const { id } = params;

	if (!id) {
		return json(
			{
				success: false,
				error: 'Alert ID is required',
				timestamp: new Date().toISOString()
			},
			{ status: 400 }
		);
	}

	try {
		await acknowledgeAlert(id);

		return json({
			success: true,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to acknowledge alert';
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
