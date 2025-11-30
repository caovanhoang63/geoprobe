import { describe, it, expect } from 'vitest';
import { extractHostAndPath, convertToGlobalpingLocations, type StoredLocationItem } from '../checker';

describe('extractHostAndPath', () => {
	it('should parse HTTPS URL correctly', () => {
		const result = extractHostAndPath('https://example.com/api/test');
		expect(result).toEqual({
			host: 'example.com',
			path: '/api/test',
			protocol: 'https'
		});
	});

	it('should parse HTTP URL correctly', () => {
		const result = extractHostAndPath('http://example.com/path');
		expect(result).toEqual({
			host: 'example.com',
			path: '/path',
			protocol: 'http'
		});
	});

	it('should handle URL with port', () => {
		const result = extractHostAndPath('https://example.com:8080/api');
		expect(result).toEqual({
			host: 'example.com:8080',
			path: '/api',
			protocol: 'https'
		});
	});

	it('should handle URL with query string', () => {
		const result = extractHostAndPath('https://example.com/search?q=test&page=1');
		expect(result).toEqual({
			host: 'example.com',
			path: '/search?q=test&page=1',
			protocol: 'https'
		});
	});

	it('should handle root path URL', () => {
		const result = extractHostAndPath('https://example.com');
		expect(result).toEqual({
			host: 'example.com',
			path: '/',
			protocol: 'https'
		});
	});

	it('should handle URL with trailing slash', () => {
		const result = extractHostAndPath('https://example.com/');
		expect(result).toEqual({
			host: 'example.com',
			path: '/',
			protocol: 'https'
		});
	});

	it('should handle subdomain', () => {
		const result = extractHostAndPath('https://api.example.com/v1/users');
		expect(result).toEqual({
			host: 'api.example.com',
			path: '/v1/users',
			protocol: 'https'
		});
	});

	it('should fallback for invalid URL', () => {
		const result = extractHostAndPath('not-a-valid-url');
		expect(result).toEqual({
			host: 'not-a-valid-url',
			path: '/',
			protocol: 'https'
		});
	});

	it('should handle empty string', () => {
		const result = extractHostAndPath('');
		expect(result).toEqual({
			host: '',
			path: '/',
			protocol: 'https'
		});
	});
});

describe('convertToGlobalpingLocations', () => {
	it('should convert continent location', () => {
		const input: StoredLocationItem[] = [
			{
				location: {
					type: 'continent',
					code: 'EU',
					name: 'Europe'
				},
				networkType: 'any'
			}
		];

		const result = convertToGlobalpingLocations(input);
		expect(result).toEqual([{ continent: 'EU' }]);
	});

	it('should convert country location', () => {
		const input: StoredLocationItem[] = [
			{
				location: {
					type: 'country',
					code: 'US',
					name: 'United States'
				},
				networkType: 'any'
			}
		];

		const result = convertToGlobalpingLocations(input);
		expect(result).toEqual([{ country: 'US' }]);
	});

	it('should convert city location', () => {
		const input: StoredLocationItem[] = [
			{
				location: {
					type: 'city',
					code: 'NYC',
					name: 'New York'
				},
				networkType: 'any'
			}
		];

		const result = convertToGlobalpingLocations(input);
		expect(result).toEqual([{ city: 'New York' }]);
	});

	it('should include network type tag when not any', () => {
		const input: StoredLocationItem[] = [
			{
				location: {
					type: 'country',
					code: 'US',
					name: 'United States'
				},
				networkType: 'residential'
			}
		];

		const result = convertToGlobalpingLocations(input);
		expect(result).toEqual([{ country: 'US', tags: ['residential'] }]);
	});

	it('should handle datacenter network type', () => {
		const input: StoredLocationItem[] = [
			{
				location: {
					type: 'country',
					code: 'DE',
					name: 'Germany'
				},
				networkType: 'datacenter'
			}
		];

		const result = convertToGlobalpingLocations(input);
		expect(result).toEqual([{ country: 'DE', tags: ['datacenter'] }]);
	});

	it('should handle legacy format without location object', () => {
		const input: StoredLocationItem[] = [
			{
				country: 'FR',
				tags: ['residential']
			}
		];

		const result = convertToGlobalpingLocations(input);
		expect(result).toEqual([{ country: 'FR', tags: ['residential'] }]);
	});

	it('should handle multiple locations', () => {
		const input: StoredLocationItem[] = [
			{
				location: { type: 'country', code: 'US', name: 'United States' },
				networkType: 'any'
			},
			{
				location: { type: 'country', code: 'DE', name: 'Germany' },
				networkType: 'residential'
			},
			{
				location: { type: 'city', code: 'TYO', name: 'Tokyo' },
				networkType: 'datacenter'
			}
		];

		const result = convertToGlobalpingLocations(input);
		expect(result).toEqual([
			{ country: 'US' },
			{ country: 'DE', tags: ['residential'] },
			{ city: 'Tokyo', tags: ['datacenter'] }
		]);
	});

	it('should handle empty array', () => {
		const result = convertToGlobalpingLocations([]);
		expect(result).toEqual([]);
	});

	it('should handle item with empty location object', () => {
		const input: StoredLocationItem[] = [
			{
				location: {},
				networkType: 'residential'
			}
		];

		const result = convertToGlobalpingLocations(input);
		expect(result).toEqual([{ tags: ['residential'] }]);
	});
});
