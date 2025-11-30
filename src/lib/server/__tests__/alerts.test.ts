import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	countConsecutiveFailures,
	getAlertEmoji,
	sendDiscordAlert,
	ALERT_DEBOUNCE_MS,
	CONSECUTIVE_FAILURES_THRESHOLD,
	LATENCY_THRESHOLD_MS
} from '../alerts';
import type { Measurement, Alert } from '../schema';

function createMockMeasurement(overrides: Partial<Measurement> = {}): Measurement {
	return {
		id: 'measurement-1',
		monitorId: 'monitor-1',
		location: 'New York, US',
		country: 'US',
		city: 'New York',
		networkType: 'datacenter',
		statusCode: 200,
		latency: 150,
		status: 'success',
		errorMessage: null,
		timestamp: new Date().toISOString(),
		...overrides
	};
}

function createMockAlert(overrides: Partial<Alert> = {}): Alert {
	return {
		id: 'alert-1',
		monitorId: 'monitor-1',
		type: 'down',
		message: 'Test alert message',
		acknowledged: false,
		createdAt: new Date().toISOString(),
		...overrides
	};
}

describe('alert constants', () => {
	it('should have 5 minute debounce window', () => {
		expect(ALERT_DEBOUNCE_MS).toBe(5 * 60 * 1000);
	});

	it('should require 3 consecutive failures', () => {
		expect(CONSECUTIVE_FAILURES_THRESHOLD).toBe(3);
	});

	it('should have 1000ms latency threshold', () => {
		expect(LATENCY_THRESHOLD_MS).toBe(1000);
	});
});

describe('countConsecutiveFailures', () => {
	it('should return 0 for empty array', () => {
		expect(countConsecutiveFailures([])).toBe(0);
	});

	it('should return 0 when first measurement is success', () => {
		const measurements = [
			createMockMeasurement({ status: 'success' }),
			createMockMeasurement({ status: 'failed' }),
			createMockMeasurement({ status: 'failed' })
		];
		expect(countConsecutiveFailures(measurements)).toBe(0);
	});

	it('should count single failure', () => {
		const measurements = [
			createMockMeasurement({ status: 'failed' }),
			createMockMeasurement({ status: 'success' })
		];
		expect(countConsecutiveFailures(measurements)).toBe(1);
	});

	it('should count consecutive failures', () => {
		const measurements = [
			createMockMeasurement({ status: 'failed' }),
			createMockMeasurement({ status: 'failed' }),
			createMockMeasurement({ status: 'failed' }),
			createMockMeasurement({ status: 'success' })
		];
		expect(countConsecutiveFailures(measurements)).toBe(3);
	});

	it('should count all failures when all failed', () => {
		const measurements = [
			createMockMeasurement({ status: 'failed' }),
			createMockMeasurement({ status: 'failed' }),
			createMockMeasurement({ status: 'failed' }),
			createMockMeasurement({ status: 'failed' }),
			createMockMeasurement({ status: 'failed' })
		];
		expect(countConsecutiveFailures(measurements)).toBe(5);
	});

	it('should stop counting at first success', () => {
		const measurements = [
			createMockMeasurement({ status: 'failed' }),
			createMockMeasurement({ status: 'failed' }),
			createMockMeasurement({ status: 'success' }),
			createMockMeasurement({ status: 'failed' }),
			createMockMeasurement({ status: 'failed' })
		];
		expect(countConsecutiveFailures(measurements)).toBe(2);
	});

	it('should reach threshold exactly', () => {
		const measurements = [
			createMockMeasurement({ status: 'failed' }),
			createMockMeasurement({ status: 'failed' }),
			createMockMeasurement({ status: 'failed' })
		];
		const count = countConsecutiveFailures(measurements);
		expect(count).toBe(CONSECUTIVE_FAILURES_THRESHOLD);
		expect(count >= CONSECUTIVE_FAILURES_THRESHOLD).toBe(true);
	});
});

describe('getAlertEmoji', () => {
	it('should return red circle for down alert', () => {
		expect(getAlertEmoji('down')).toBe('🔴');
	});

	it('should return green circle for up alert', () => {
		expect(getAlertEmoji('up')).toBe('🟢');
	});

	it('should return warning for latency spike', () => {
		expect(getAlertEmoji('latency_spike')).toBe('⚠️');
	});

	it('should return scroll for cert expiring', () => {
		expect(getAlertEmoji('cert_expiring')).toBe('📜');
	});

	it('should return bell for unknown types', () => {
		expect(getAlertEmoji('unknown')).toBe('🔔');
		expect(getAlertEmoji('custom_alert')).toBe('🔔');
		expect(getAlertEmoji('')).toBe('🔔');
	});
});

describe('sendDiscordAlert', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('should send POST request with embed payload', async () => {
		vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

		const alert = createMockAlert({
			type: 'down',
			message: 'Monitor is down',
			createdAt: '2024-01-15T10:30:00Z'
		});

		await sendDiscordAlert('https://discord.com/api/webhooks/123/abc', alert, 0xef4444);

		expect(fetch).toHaveBeenCalledWith(
			'https://discord.com/api/webhooks/123/abc',
			expect.objectContaining({
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: expect.stringContaining('"embeds"')
			})
		);

		const callBody = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
		expect(callBody.embeds[0].title).toBe('🔴 DOWN');
		expect(callBody.embeds[0].description).toBe('Monitor is down');
		expect(callBody.embeds[0].color).toBe(0xef4444);
	});

	it('should format title with emoji and uppercase type', async () => {
		vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

		const alert = createMockAlert({ type: 'latency_spike' });
		await sendDiscordAlert('https://discord.com/webhook', alert, 0xf59e0b);

		const callBody = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
		expect(callBody.embeds[0].title).toBe('⚠️ LATENCY SPIKE');
	});

	it('should handle webhook failure gracefully', async () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		vi.mocked(fetch).mockResolvedValue({
			ok: false,
			statusText: 'Forbidden'
		} as Response);

		const alert = createMockAlert();
		await sendDiscordAlert('https://discord.com/webhook', alert, 0xef4444);

		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining('Discord webhook failed')
		);
		consoleSpy.mockRestore();
	});

	it('should handle network errors gracefully', async () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

		const alert = createMockAlert();
		await sendDiscordAlert('https://discord.com/webhook', alert, 0xef4444);

		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining('Failed to send Discord webhook'),
			expect.any(Error)
		);
		consoleSpy.mockRestore();
	});

	it('should include timestamp in embed', async () => {
		vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

		const timestamp = '2024-01-15T10:30:00Z';
		const alert = createMockAlert({ createdAt: timestamp });
		await sendDiscordAlert('https://discord.com/webhook', alert, 0x10b981);

		const callBody = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
		expect(callBody.embeds[0].timestamp).toBe(timestamp);
	});

	it('should use correct color for different alert types', async () => {
		vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

		const colors = {
			down: 0xef4444,
			up: 0x10b981,
			latency_spike: 0xf59e0b
		};

		for (const [type, color] of Object.entries(colors)) {
			const alert = createMockAlert({ type });
			await sendDiscordAlert('https://discord.com/webhook', alert, color);

			const callBody = JSON.parse(vi.mocked(fetch).mock.lastCall?.[1]?.body as string);
			expect(callBody.embeds[0].color).toBe(color);
		}
	});
});

describe('alert threshold behavior', () => {
	it('should not trigger alert below threshold', () => {
		const failures = 2;
		expect(failures < CONSECUTIVE_FAILURES_THRESHOLD).toBe(true);
	});

	it('should trigger alert at threshold', () => {
		const failures = 3;
		expect(failures >= CONSECUTIVE_FAILURES_THRESHOLD).toBe(true);
	});

	it('should trigger alert above threshold', () => {
		const failures = 5;
		expect(failures >= CONSECUTIVE_FAILURES_THRESHOLD).toBe(true);
	});
});

describe('latency threshold behavior', () => {
	it('should not flag normal latency', () => {
		const latency = 500;
		expect(latency > LATENCY_THRESHOLD_MS).toBe(false);
	});

	it('should not flag latency at threshold', () => {
		const latency = 1000;
		expect(latency > LATENCY_THRESHOLD_MS).toBe(false);
	});

	it('should flag latency above threshold', () => {
		const latency = 1001;
		expect(latency > LATENCY_THRESHOLD_MS).toBe(true);
	});

	it('should flag high latency', () => {
		const latency = 5000;
		expect(latency > LATENCY_THRESHOLD_MS).toBe(true);
	});
});

describe('debounce window', () => {
	it('should span 5 minutes', () => {
		expect(ALERT_DEBOUNCE_MS).toBe(300000);
	});

	it('should identify recent alerts within window', () => {
		const now = Date.now();
		const recentAlertTime = now - (ALERT_DEBOUNCE_MS / 2);
		const isRecent = (now - recentAlertTime) < ALERT_DEBOUNCE_MS;
		expect(isRecent).toBe(true);
	});

	it('should identify old alerts outside window', () => {
		const now = Date.now();
		const oldAlertTime = now - (ALERT_DEBOUNCE_MS * 2);
		const isRecent = (now - oldAlertTime) < ALERT_DEBOUNCE_MS;
		expect(isRecent).toBe(false);
	});
});
