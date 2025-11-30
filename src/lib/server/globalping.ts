import type { GlobalpingRequest, GlobalpingResponse } from '$lib/types/globalping';

const API_BASE = 'https://api.globalping.io/v1';

export async function createMeasurement(request: GlobalpingRequest): Promise<string> {
	const response = await fetch(`${API_BASE}/measurements`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(request)
	});

	if (!response.ok) {
		throw new Error(`Globalping API error: ${response.status} ${await response.text()}`);
	}

	const data = (await response.json()) as GlobalpingResponse;
	console.log(`[Globalping] Created measurement: ${data.id}`);
	return data.id;
}

export async function pollMeasurement(id: string): Promise<GlobalpingResponse> {
	let delay = 1000;
	const maxDelay = 5000;
	const maxAttempts = 20;

	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		await new Promise((resolve) => setTimeout(resolve, delay));

		const response = await fetch(`${API_BASE}/measurements/${id}`);
		if (!response.ok) {
			throw new Error(`Poll failed: ${response.status}`);
		}

		const data = (await response.json()) as GlobalpingResponse;

		if (data.status !== 'in-progress') {
			console.log(`[Globalping] Measurement ${id} completed after ${attempt + 1} polls`);
			return data;
		}

		delay = Math.min(delay * 1.5, maxDelay);
	}

	throw new Error(`Measurement ${id} timed out after ${maxAttempts} polls`);
}

export async function runMeasurement(request: GlobalpingRequest): Promise<GlobalpingResponse> {
	const id = await createMeasurement(request);
	return await pollMeasurement(id);
}
