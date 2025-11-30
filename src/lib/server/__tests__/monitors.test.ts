import { describe, it, expect } from 'vitest';
import { monitorFormSchema } from '../monitors';

describe('monitorFormSchema validation', () => {
	const validLocation = {
		location: {
			id: 'loc-1',
			name: 'United States',
			code: 'US',
			type: 'country' as const,
			networkTypes: ['residential' as const, 'datacenter' as const]
		},
		networkType: 'any' as const,
		color: '#ff0000'
	};

	describe('name validation', () => {
		it('should accept valid name', () => {
			const result = monitorFormSchema.safeParse({
				name: 'Production Server',
				url: 'https://example.com',
				interval: 300,
				locations: [validLocation]
			});
			expect(result.success).toBe(true);
		});

		it('should reject name shorter than 2 characters', () => {
			const result = monitorFormSchema.safeParse({
				name: 'A',
				url: 'https://example.com',
				interval: 300,
				locations: [validLocation]
			});
			expect(result.success).toBe(false);
		});

		it('should reject name longer than 100 characters', () => {
			const result = monitorFormSchema.safeParse({
				name: 'A'.repeat(101),
				url: 'https://example.com',
				interval: 300,
				locations: [validLocation]
			});
			expect(result.success).toBe(false);
		});

		it('should reject empty name', () => {
			const result = monitorFormSchema.safeParse({
				name: '',
				url: 'https://example.com',
				interval: 300,
				locations: [validLocation]
			});
			expect(result.success).toBe(false);
		});
	});

	describe('url validation', () => {
		it('should accept valid HTTPS URL', () => {
			const result = monitorFormSchema.safeParse({
				name: 'Test Monitor',
				url: 'https://example.com',
				interval: 300,
				locations: [validLocation]
			});
			expect(result.success).toBe(true);
		});

		it('should accept valid HTTP URL', () => {
			const result = monitorFormSchema.safeParse({
				name: 'Test Monitor',
				url: 'http://example.com',
				interval: 300,
				locations: [validLocation]
			});
			expect(result.success).toBe(true);
		});

		it('should reject invalid URL', () => {
			const result = monitorFormSchema.safeParse({
				name: 'Test Monitor',
				url: 'not-a-url',
				interval: 300,
				locations: [validLocation]
			});
			expect(result.success).toBe(false);
		});

		it('should reject empty URL', () => {
			const result = monitorFormSchema.safeParse({
				name: 'Test Monitor',
				url: '',
				interval: 300,
				locations: [validLocation]
			});
			expect(result.success).toBe(false);
		});
	});

	describe('interval validation', () => {
		it('should accept minimum interval of 60 seconds', () => {
			const result = monitorFormSchema.safeParse({
				name: 'Test Monitor',
				url: 'https://example.com',
				interval: 60,
				locations: [validLocation]
			});
			expect(result.success).toBe(true);
		});

		it('should accept maximum interval of 3600 seconds', () => {
			const result = monitorFormSchema.safeParse({
				name: 'Test Monitor',
				url: 'https://example.com',
				interval: 3600,
				locations: [validLocation]
			});
			expect(result.success).toBe(true);
		});

		it('should reject interval below 60 seconds', () => {
			const result = monitorFormSchema.safeParse({
				name: 'Test Monitor',
				url: 'https://example.com',
				interval: 30,
				locations: [validLocation]
			});
			expect(result.success).toBe(false);
		});

		it('should reject interval above 3600 seconds', () => {
			const result = monitorFormSchema.safeParse({
				name: 'Test Monitor',
				url: 'https://example.com',
				interval: 7200,
				locations: [validLocation]
			});
			expect(result.success).toBe(false);
		});

		it('should reject non-integer interval', () => {
			const result = monitorFormSchema.safeParse({
				name: 'Test Monitor',
				url: 'https://example.com',
				interval: 300.5,
				locations: [validLocation]
			});
			expect(result.success).toBe(false);
		});
	});

	describe('locations validation', () => {
		it('should accept single location', () => {
			const result = monitorFormSchema.safeParse({
				name: 'Test Monitor',
				url: 'https://example.com',
				interval: 300,
				locations: [validLocation]
			});
			expect(result.success).toBe(true);
		});

		it('should accept multiple locations', () => {
			const result = monitorFormSchema.safeParse({
				name: 'Test Monitor',
				url: 'https://example.com',
				interval: 300,
				locations: [
					validLocation,
					{
						...validLocation,
						location: { ...validLocation.location, id: 'loc-2', code: 'DE' }
					}
				]
			});
			expect(result.success).toBe(true);
		});

		it('should reject empty locations array', () => {
			const result = monitorFormSchema.safeParse({
				name: 'Test Monitor',
				url: 'https://example.com',
				interval: 300,
				locations: []
			});
			expect(result.success).toBe(false);
		});
	});

	describe('discordWebhook validation', () => {
		it('should accept valid Discord webhook URL', () => {
			const result = monitorFormSchema.safeParse({
				name: 'Test Monitor',
				url: 'https://example.com',
				interval: 300,
				locations: [validLocation],
				discordWebhook: 'https://discord.com/api/webhooks/123456/token'
			});
			expect(result.success).toBe(true);
		});

		it('should accept empty string for discordWebhook', () => {
			const result = monitorFormSchema.safeParse({
				name: 'Test Monitor',
				url: 'https://example.com',
				interval: 300,
				locations: [validLocation],
				discordWebhook: ''
			});
			expect(result.success).toBe(true);
		});

		it('should accept undefined discordWebhook', () => {
			const result = monitorFormSchema.safeParse({
				name: 'Test Monitor',
				url: 'https://example.com',
				interval: 300,
				locations: [validLocation]
			});
			expect(result.success).toBe(true);
		});

		it('should reject invalid webhook URL', () => {
			const result = monitorFormSchema.safeParse({
				name: 'Test Monitor',
				url: 'https://example.com',
				interval: 300,
				locations: [validLocation],
				discordWebhook: 'not-a-url'
			});
			expect(result.success).toBe(false);
		});
	});

	describe('complete form validation', () => {
		it('should validate complete valid form', () => {
			const result = monitorFormSchema.safeParse({
				name: 'Production API',
				url: 'https://api.example.com/health',
				interval: 300,
				locations: [
					{
						location: {
							id: 'us-east',
							name: 'US East',
							code: 'US',
							type: 'country',
							networkTypes: ['residential', 'datacenter']
						},
						networkType: 'datacenter',
						color: '#3b82f6'
					}
				],
				discordWebhook: 'https://discord.com/api/webhooks/123/abc'
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.name).toBe('Production API');
				expect(result.data.interval).toBe(300);
			}
		});
	});
});
