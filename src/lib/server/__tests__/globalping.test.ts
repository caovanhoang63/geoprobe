import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMeasurement, pollMeasurement, runMeasurement, API_BASE, FETCH_TIMEOUT, MAX_RETRIES } from '../globalping';

describe('globalping constants', () => {
	it('should have correct API base URL', () => {
		expect(API_BASE).toBe('https://api.globalping.io/v1');
	});

	it('should have 30 second fetch timeout', () => {
		expect(FETCH_TIMEOUT).toBe(30000);
	});

	it('should have 3 max retries', () => {
		expect(MAX_RETRIES).toBe(3);
	});
});

describe('createMeasurement', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('should create measurement and return ID', async () => {
		const mockResponse = {
			ok: true,
			json: () => Promise.resolve({ id: 'test-measurement-id', status: 'in-progress' })
		};
		vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

		const request = {
			type: 'http' as const,
			target: 'example.com',
			locations: [{ country: 'US' }]
		};

		const id = await createMeasurement(request);
		expect(id).toBe('test-measurement-id');
		expect(fetch).toHaveBeenCalledWith(
			`${API_BASE}/measurements`,
			expect.objectContaining({
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(request)
			})
		);
	});

	it('should throw error on API failure', async () => {
		const mockResponse = {
			ok: false,
			status: 400,
			text: () => Promise.resolve('Invalid request')
		};
		vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

		const request = {
			type: 'http' as const,
			target: 'example.com',
			locations: [{ country: 'US' }]
		};

		await expect(createMeasurement(request)).rejects.toThrow('Globalping API error: 400');
	});

	it('should retry on network failure', async () => {
		vi.useFakeTimers();

		const mockResponse = {
			ok: true,
			json: () => Promise.resolve({ id: 'retry-success-id', status: 'in-progress' })
		};

		vi.mocked(fetch)
			.mockRejectedValueOnce(new Error('Network error'))
			.mockRejectedValueOnce(new Error('Network error'))
			.mockResolvedValueOnce(mockResponse as Response);

		const request = {
			type: 'http' as const,
			target: 'example.com',
			locations: [{ country: 'US' }]
		};

		const promise = createMeasurement(request);

		await vi.advanceTimersByTimeAsync(1000);
		await vi.advanceTimersByTimeAsync(2000);

		const id = await promise;
		expect(id).toBe('retry-success-id');
		expect(fetch).toHaveBeenCalledTimes(3);

		vi.useRealTimers();
	});

	it('should throw after max retries exceeded', async () => {
		vi.mocked(fetch).mockRejectedValue(new Error('Persistent failure'));

		const request = {
			type: 'http' as const,
			target: 'example.com',
			locations: [{ country: 'US' }]
		};

		await expect(createMeasurement(request)).rejects.toThrow('Persistent failure');
		expect(fetch).toHaveBeenCalledTimes(MAX_RETRIES);
	});
});

describe('pollMeasurement', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.useRealTimers();
	});

	it('should return result when measurement completes', async () => {
		const completedResponse = {
			id: 'test-id',
			status: 'finished',
			results: [{ probe: { city: 'NYC', country: 'US', tags: [] }, result: {} }]
		};

		vi.mocked(fetch).mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(completedResponse)
		} as Response);

		const promise = pollMeasurement('test-id');
		await vi.advanceTimersByTimeAsync(1000);

		const result = await promise;
		expect(result.status).toBe('finished');
		expect(result.id).toBe('test-id');
	});

	it('should poll multiple times until complete', async () => {
		const inProgressResponse = { id: 'test-id', status: 'in-progress' };
		const completedResponse = { id: 'test-id', status: 'finished', results: [] };

		vi.mocked(fetch)
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(inProgressResponse) } as Response)
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(inProgressResponse) } as Response)
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(completedResponse) } as Response);

		const promise = pollMeasurement('test-id');

		await vi.advanceTimersByTimeAsync(1000);
		await vi.advanceTimersByTimeAsync(1500);
		await vi.advanceTimersByTimeAsync(2250);

		const result = await promise;
		expect(result.status).toBe('finished');
		expect(fetch).toHaveBeenCalledTimes(3);
	});

	it('should throw error on poll failure', async () => {
		vi.mocked(fetch).mockResolvedValue({
			ok: false,
			status: 404
		} as Response);

		let caughtError: Error | undefined;
		const promise = pollMeasurement('nonexistent-id').catch((e) => {
			caughtError = e;
		});

		await vi.advanceTimersByTimeAsync(1000);
		await promise;

		expect(caughtError).toBeDefined();
		expect(caughtError?.message).toBe('Poll failed: 404');
	});

	it('should timeout after max attempts', async () => {
		const inProgressResponse = { id: 'test-id', status: 'in-progress' };

		vi.mocked(fetch).mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(inProgressResponse)
		} as Response);

		let caughtError: Error | undefined;
		const promise = pollMeasurement('test-id').catch((e) => {
			caughtError = e;
		});

		for (let i = 0; i < 25; i++) {
			await vi.advanceTimersByTimeAsync(5000);
		}
		await promise;

		expect(caughtError).toBeDefined();
		expect(caughtError?.message).toContain('timed out after 20 polls');
	});
});

describe('runMeasurement', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.useRealTimers();
	});

	it('should create and poll measurement', async () => {
		const createResponse = { id: 'new-measurement', status: 'in-progress' };
		const pollResponse = { id: 'new-measurement', status: 'finished', results: [] };

		vi.mocked(fetch)
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(createResponse) } as Response)
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(pollResponse) } as Response);

		const request = {
			type: 'http' as const,
			target: 'example.com',
			locations: [{ country: 'US' }]
		};

		const promise = runMeasurement(request);
		await vi.advanceTimersByTimeAsync(1000);

		const result = await promise;
		expect(result.status).toBe('finished');
		expect(result.id).toBe('new-measurement');
	});
});
