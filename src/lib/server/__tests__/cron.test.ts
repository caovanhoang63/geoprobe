import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isMonitorDueForCheck } from '../cron';
import type { Monitor } from '../schema';

function createMockMonitor(overrides: Partial<Monitor> = {}): Monitor {
	return {
		id: 'test-monitor-1',
		name: 'Test Monitor',
		url: 'https://example.com',
		interval: 300,
		locations: '[]',
		discordWebhook: null,
		active: true,
		public: false,
		lastCheckedAt: null,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		...overrides
	};
}

describe('isMonitorDueForCheck', () => {
	let mockActiveChecks: Set<string>;

	beforeEach(() => {
		mockActiveChecks = new Set<string>();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should return true for monitor with null lastCheckedAt', () => {
		const monitor = createMockMonitor({ lastCheckedAt: null });
		expect(isMonitorDueForCheck(monitor, mockActiveChecks)).toBe(true);
	});

	it('should return false for monitor currently being checked', () => {
		const monitor = createMockMonitor();
		mockActiveChecks.add(monitor.id);
		expect(isMonitorDueForCheck(monitor, mockActiveChecks)).toBe(false);
	});

	it('should return true when interval has elapsed', () => {
		const now = Date.now();
		vi.setSystemTime(now);

		const lastChecked = new Date(now - 400 * 1000).toISOString();
		const monitor = createMockMonitor({
			interval: 300,
			lastCheckedAt: lastChecked
		});

		expect(isMonitorDueForCheck(monitor, mockActiveChecks)).toBe(true);
	});

	it('should return false when interval has not elapsed', () => {
		const now = Date.now();
		vi.setSystemTime(now);

		const lastChecked = new Date(now - 100 * 1000).toISOString();
		const monitor = createMockMonitor({
			interval: 300,
			lastCheckedAt: lastChecked
		});

		expect(isMonitorDueForCheck(monitor, mockActiveChecks)).toBe(false);
	});

	it('should return true exactly at interval boundary', () => {
		const now = Date.now();
		vi.setSystemTime(now);

		const lastChecked = new Date(now - 300 * 1000).toISOString();
		const monitor = createMockMonitor({
			interval: 300,
			lastCheckedAt: lastChecked
		});

		expect(isMonitorDueForCheck(monitor, mockActiveChecks)).toBe(true);
	});

	it('should handle clock skew (future lastCheckedAt)', () => {
		const now = Date.now();
		vi.setSystemTime(now);

		const futureTime = new Date(now + 60 * 1000).toISOString();
		const monitor = createMockMonitor({
			lastCheckedAt: futureTime
		});

		expect(isMonitorDueForCheck(monitor, mockActiveChecks)).toBe(true);
	});

	it('should work with 60-second interval', () => {
		const now = Date.now();
		vi.setSystemTime(now);

		const lastChecked = new Date(now - 61 * 1000).toISOString();
		const monitor = createMockMonitor({
			interval: 60,
			lastCheckedAt: lastChecked
		});

		expect(isMonitorDueForCheck(monitor, mockActiveChecks)).toBe(true);
	});

	it('should work with 3600-second interval', () => {
		const now = Date.now();
		vi.setSystemTime(now);

		const lastChecked = new Date(now - 3500 * 1000).toISOString();
		const monitor = createMockMonitor({
			interval: 3600,
			lastCheckedAt: lastChecked
		});

		expect(isMonitorDueForCheck(monitor, mockActiveChecks)).toBe(false);
	});
});
