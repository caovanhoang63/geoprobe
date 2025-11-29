import { db } from '../src/lib/server/db';
import { monitors } from '../src/lib/server/schema';

async function testDatabase() {
	try {
		console.log('[Test] Inserting test monitor...');

		const testMonitor = await db
			.insert(monitors)
			.values({
				name: 'Test Monitor',
				url: 'https://example.com',
				interval: 300,
				locations: JSON.stringify([{ country: 'US' }, { country: 'DE' }])
			})
			.returning();

		console.log('[Test] Created monitor:', testMonitor);

		console.log('[Test] Querying all monitors...');
		const allMonitors = await db.select().from(monitors);
		console.log('[Test] All monitors:', allMonitors);

		console.log('[Test] Database test completed successfully!');
	} catch (error) {
		console.error('[Test] Database test failed:', error);
		process.exit(1);
	}
}

testDatabase();