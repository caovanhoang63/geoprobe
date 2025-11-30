import type { PageServerLoad } from './$types';
import { getMonitors } from '$lib/server/monitors';

export const load: PageServerLoad = async () => {
	const monitors = await getMonitors();

	return {
		monitors
	};
};
