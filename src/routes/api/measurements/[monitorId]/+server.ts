import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { measurements } from '$lib/server/schema';
import { eq, gte, and, desc } from 'drizzle-orm';

function getTimestampForRange(range: string): string {
	const now = new Date();

	switch (range) {
		case '1h':
			now.setHours(now.getHours() - 1);
			break;
		case '6h':
			now.setHours(now.getHours() - 6);
			break;
		case '24h':
			now.setHours(now.getHours() - 24);
			break;
		case '7d':
			now.setDate(now.getDate() - 7);
			break;
		case '30d':
			now.setDate(now.getDate() - 30);
			break;
		default:
			now.setHours(now.getHours() - 24);
	}

	return now.toISOString();
}

export const GET: RequestHandler = async ({ params, url }) => {
	const monitorId = params.monitorId;

	if (!monitorId) {
		return json({ error: 'Monitor ID is required' }, { status: 400 });
	}

	const timeRange = url.searchParams.get('timeRange') || '24h';
	const location = url.searchParams.get('location');

	try {
		const timestamp = getTimestampForRange(timeRange);

		let results;

		if (location) {
			results = await db
				.select()
				.from(measurements)
				.where(
					and(
						eq(measurements.monitorId, monitorId),
						gte(measurements.timestamp, timestamp),
						eq(measurements.location, location)
					)
				)
				.orderBy(desc(measurements.timestamp))
				.limit(1000);
		} else {
			results = await db
				.select()
				.from(measurements)
				.where(and(eq(measurements.monitorId, monitorId), gte(measurements.timestamp, timestamp)))
				.orderBy(desc(measurements.timestamp))
				.limit(1000);
		}

		return json({
			measurements: results,
			total: results.length,
			timeRange,
			location: location || 'all'
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to fetch measurements';
		return json({ error: message }, { status: 500 });
	}
};
