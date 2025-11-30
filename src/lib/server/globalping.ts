import type { GlobalpingRequest, GlobalpingResponse } from '$lib/types/globalping';

export const API_BASE = 'https://api.globalping.io/v1';
export const FETCH_TIMEOUT = 30000;
export const MAX_RETRIES = 3;

async function fetchWithTimeout(
	url: string,
	options: RequestInit = {},
	timeout = FETCH_TIMEOUT
): Promise<Response> {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	try {
		const response = await fetch(url, {
			...options,
			signal: controller.signal
		});
		return response;
	} finally {
		clearTimeout(timeoutId);
	}
}

async function fetchWithRetry(
	url: string,
	options: RequestInit = {},
	retries = MAX_RETRIES
): Promise<Response> {
	let lastError: Error | null = null;

	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			return await fetchWithTimeout(url, options);
		} catch (error) {
			lastError = error as Error;
			console.warn(`[Globalping] Attempt ${attempt}/${retries} failed: ${lastError.message}`);

			if (attempt < retries) {
				const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}

	throw lastError;
}

export async function createMeasurement(request: GlobalpingRequest): Promise<string> {
	const response = await fetchWithRetry(`${API_BASE}/measurements`, {
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

		const response = await fetchWithRetry(`${API_BASE}/measurements/${id}`);
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
