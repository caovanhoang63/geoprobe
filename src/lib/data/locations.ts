import type { Location, NetworkType } from '$lib/types/location';

const BOTH_NETWORKS: NetworkType[] = ['residential', 'datacenter'];
const DATACENTER_ONLY: NetworkType[] = ['datacenter'];
const RESIDENTIAL_ONLY: NetworkType[] = ['residential'];

export const LOCATIONS: Location[] = [
	{ id: 'AS', type: 'continent', name: 'Asia', code: 'AS', networkTypes: BOTH_NETWORKS, probeCount: 2847 },
	{ id: 'EU', type: 'continent', name: 'Europe', code: 'EU', networkTypes: BOTH_NETWORKS, probeCount: 4215 },
	{ id: 'NA', type: 'continent', name: 'North America', code: 'NA', networkTypes: BOTH_NETWORKS, probeCount: 3892 },
	{ id: 'SA', type: 'continent', name: 'South America', code: 'SA', networkTypes: BOTH_NETWORKS, probeCount: 892 },
	{ id: 'AF', type: 'continent', name: 'Africa', code: 'AF', networkTypes: BOTH_NETWORKS, probeCount: 423 },
	{ id: 'OC', type: 'continent', name: 'Oceania', code: 'OC', networkTypes: BOTH_NETWORKS, probeCount: 687 },

	{ id: 'VN', type: 'country', name: 'Vietnam', code: 'VN', parentId: 'AS', networkTypes: BOTH_NETWORKS, isps: ['VNPT', 'Viettel', 'FPT', 'MobiFone'], probeCount: 342 },
	{ id: 'JP', type: 'country', name: 'Japan', code: 'JP', parentId: 'AS', networkTypes: BOTH_NETWORKS, isps: ['NTT', 'KDDI', 'SoftBank', 'IIJ'], probeCount: 567 },
	{ id: 'SG', type: 'country', name: 'Singapore', code: 'SG', parentId: 'AS', networkTypes: BOTH_NETWORKS, isps: ['Singtel', 'StarHub', 'M1'], probeCount: 234 },
	{ id: 'KR', type: 'country', name: 'South Korea', code: 'KR', parentId: 'AS', networkTypes: BOTH_NETWORKS, isps: ['KT', 'SKT', 'LG U+'], probeCount: 412 },
	{ id: 'IN', type: 'country', name: 'India', code: 'IN', parentId: 'AS', networkTypes: BOTH_NETWORKS, isps: ['Jio', 'Airtel', 'BSNL', 'VI'], probeCount: 623 },
	{ id: 'CN', type: 'country', name: 'China', code: 'CN', parentId: 'AS', networkTypes: DATACENTER_ONLY, isps: ['China Telecom', 'China Unicom', 'China Mobile'], probeCount: 487 },

	{ id: 'DE', type: 'country', name: 'Germany', code: 'DE', parentId: 'EU', networkTypes: BOTH_NETWORKS, isps: ['Deutsche Telekom', 'Vodafone', 'O2', 'Hetzner'], probeCount: 892 },
	{ id: 'GB', type: 'country', name: 'United Kingdom', code: 'GB', parentId: 'EU', networkTypes: BOTH_NETWORKS, isps: ['BT', 'Virgin Media', 'Sky', 'TalkTalk'], probeCount: 756 },
	{ id: 'FR', type: 'country', name: 'France', code: 'FR', parentId: 'EU', networkTypes: BOTH_NETWORKS, isps: ['Orange', 'SFR', 'Free', 'Bouygues'], probeCount: 623 },
	{ id: 'NL', type: 'country', name: 'Netherlands', code: 'NL', parentId: 'EU', networkTypes: BOTH_NETWORKS, isps: ['KPN', 'Ziggo', 'T-Mobile NL'], probeCount: 534 },
	{ id: 'PL', type: 'country', name: 'Poland', code: 'PL', parentId: 'EU', networkTypes: BOTH_NETWORKS, isps: ['Orange PL', 'Play', 'Plus', 'T-Mobile PL'], probeCount: 287 },

	{ id: 'US', type: 'country', name: 'United States', code: 'US', parentId: 'NA', networkTypes: BOTH_NETWORKS, isps: ['Comcast', 'AT&T', 'Verizon', 'Spectrum', 'AWS', 'GCP', 'Azure'], probeCount: 2156 },
	{ id: 'CA', type: 'country', name: 'Canada', code: 'CA', parentId: 'NA', networkTypes: BOTH_NETWORKS, isps: ['Bell', 'Rogers', 'Telus', 'Shaw'], probeCount: 423 },
	{ id: 'MX', type: 'country', name: 'Mexico', code: 'MX', parentId: 'NA', networkTypes: BOTH_NETWORKS, isps: ['Telmex', 'Telcel', 'AT&T Mexico'], probeCount: 187 },

	{ id: 'BR', type: 'country', name: 'Brazil', code: 'BR', parentId: 'SA', networkTypes: BOTH_NETWORKS, isps: ['Vivo', 'Claro', 'TIM', 'Oi'], probeCount: 534 },
	{ id: 'AR', type: 'country', name: 'Argentina', code: 'AR', parentId: 'SA', networkTypes: BOTH_NETWORKS, isps: ['Telecom Argentina', 'Claro AR', 'Movistar AR'], probeCount: 156 },
	{ id: 'CL', type: 'country', name: 'Chile', code: 'CL', parentId: 'SA', networkTypes: BOTH_NETWORKS, isps: ['Entel', 'Movistar Chile', 'Claro Chile'], probeCount: 98 },

	{ id: 'ZA', type: 'country', name: 'South Africa', code: 'ZA', parentId: 'AF', networkTypes: BOTH_NETWORKS, isps: ['Vodacom', 'MTN', 'Telkom SA', 'Cell C'], probeCount: 187 },
	{ id: 'NG', type: 'country', name: 'Nigeria', code: 'NG', parentId: 'AF', networkTypes: RESIDENTIAL_ONLY, isps: ['MTN Nigeria', 'Airtel Nigeria', 'Glo'], probeCount: 89 },
	{ id: 'EG', type: 'country', name: 'Egypt', code: 'EG', parentId: 'AF', networkTypes: BOTH_NETWORKS, isps: ['Vodafone Egypt', 'Orange Egypt', 'Etisalat'], probeCount: 76 },

	{ id: 'AU', type: 'country', name: 'Australia', code: 'AU', parentId: 'OC', networkTypes: BOTH_NETWORKS, isps: ['Telstra', 'Optus', 'TPG', 'iiNet'], probeCount: 456 },
	{ id: 'NZ', type: 'country', name: 'New Zealand', code: 'NZ', parentId: 'OC', networkTypes: BOTH_NETWORKS, isps: ['Spark', 'Vodafone NZ', '2degrees'], probeCount: 123 },

	{ id: 'VN-HCM', type: 'city', name: 'Ho Chi Minh City', code: 'HCM', parentId: 'VN', networkTypes: BOTH_NETWORKS, isps: ['VNPT', 'Viettel', 'FPT'], probeCount: 156 },
	{ id: 'VN-HAN', type: 'city', name: 'Hanoi', code: 'HAN', parentId: 'VN', networkTypes: BOTH_NETWORKS, isps: ['VNPT', 'Viettel', 'FPT'], probeCount: 134 },
	{ id: 'VN-DAN', type: 'city', name: 'Da Nang', code: 'DAN', parentId: 'VN', networkTypes: RESIDENTIAL_ONLY, isps: ['VNPT', 'Viettel'], probeCount: 42 },

	{ id: 'JP-TYO', type: 'city', name: 'Tokyo', code: 'TYO', parentId: 'JP', networkTypes: BOTH_NETWORKS, isps: ['NTT', 'KDDI', 'SoftBank'], probeCount: 312 },
	{ id: 'JP-OSA', type: 'city', name: 'Osaka', code: 'OSA', parentId: 'JP', networkTypes: BOTH_NETWORKS, isps: ['NTT', 'KDDI'], probeCount: 145 },

	{ id: 'DE-BER', type: 'city', name: 'Berlin', code: 'BER', parentId: 'DE', networkTypes: BOTH_NETWORKS, isps: ['Deutsche Telekom', 'Vodafone'], probeCount: 234 },
	{ id: 'DE-FRA', type: 'city', name: 'Frankfurt', code: 'FRA', parentId: 'DE', networkTypes: BOTH_NETWORKS, isps: ['Deutsche Telekom', 'Hetzner', 'OVH'], probeCount: 312 },
	{ id: 'DE-MUC', type: 'city', name: 'Munich', code: 'MUC', parentId: 'DE', networkTypes: BOTH_NETWORKS, isps: ['Deutsche Telekom', 'Vodafone'], probeCount: 156 },

	{ id: 'GB-LON', type: 'city', name: 'London', code: 'LON', parentId: 'GB', networkTypes: BOTH_NETWORKS, isps: ['BT', 'Virgin Media', 'AWS'], probeCount: 423 },
	{ id: 'GB-MAN', type: 'city', name: 'Manchester', code: 'MAN', parentId: 'GB', networkTypes: BOTH_NETWORKS, isps: ['BT', 'Virgin Media'], probeCount: 145 },

	{ id: 'US-NYC', type: 'city', name: 'New York', code: 'NYC', parentId: 'US', networkTypes: BOTH_NETWORKS, isps: ['Verizon', 'Spectrum', 'AWS', 'GCP'], probeCount: 534 },
	{ id: 'US-LAX', type: 'city', name: 'Los Angeles', code: 'LAX', parentId: 'US', networkTypes: BOTH_NETWORKS, isps: ['Spectrum', 'AT&T', 'AWS'], probeCount: 423 },
	{ id: 'US-SFO', type: 'city', name: 'San Francisco', code: 'SFO', parentId: 'US', networkTypes: BOTH_NETWORKS, isps: ['Comcast', 'AT&T', 'GCP', 'AWS'], probeCount: 387 },
	{ id: 'US-SEA', type: 'city', name: 'Seattle', code: 'SEA', parentId: 'US', networkTypes: BOTH_NETWORKS, isps: ['Comcast', 'CenturyLink', 'AWS'], probeCount: 245 },
	{ id: 'US-DFW', type: 'city', name: 'Dallas', code: 'DFW', parentId: 'US', networkTypes: BOTH_NETWORKS, isps: ['AT&T', 'Spectrum', 'Azure'], probeCount: 198 },
	{ id: 'US-CHI', type: 'city', name: 'Chicago', code: 'CHI', parentId: 'US', networkTypes: BOTH_NETWORKS, isps: ['Comcast', 'AT&T', 'AWS'], probeCount: 276 },

	{ id: 'BR-SAO', type: 'city', name: 'Sao Paulo', code: 'SAO', parentId: 'BR', networkTypes: BOTH_NETWORKS, isps: ['Vivo', 'Claro', 'TIM'], probeCount: 287 },
	{ id: 'BR-RIO', type: 'city', name: 'Rio de Janeiro', code: 'RIO', parentId: 'BR', networkTypes: BOTH_NETWORKS, isps: ['Vivo', 'Claro'], probeCount: 145 },

	{ id: 'AU-SYD', type: 'city', name: 'Sydney', code: 'SYD', parentId: 'AU', networkTypes: BOTH_NETWORKS, isps: ['Telstra', 'Optus', 'AWS'], probeCount: 234 },
	{ id: 'AU-MEL', type: 'city', name: 'Melbourne', code: 'MEL', parentId: 'AU', networkTypes: BOTH_NETWORKS, isps: ['Telstra', 'Optus'], probeCount: 156 },

	{ id: 'SG-SIN', type: 'city', name: 'Singapore City', code: 'SIN', parentId: 'SG', networkTypes: BOTH_NETWORKS, isps: ['Singtel', 'StarHub', 'AWS', 'GCP'], probeCount: 198 }
];

export function getLocationById(id: string): Location | undefined {
	return LOCATIONS.find(loc => loc.id === id);
}

export function getChildLocations(parentId: string): Location[] {
	return LOCATIONS.filter(loc => loc.parentId === parentId);
}

export function getRootLocations(): Location[] {
	return LOCATIONS.filter(loc => loc.type === 'continent');
}

export function getLocationEmoji(location: Location): string {
	const continentEmojis: Record<string, string> = {
		AS: '🌏',
		EU: '🌍',
		NA: '🌎',
		SA: '🌎',
		AF: '🌍',
		OC: '🌏'
	};

	const countryFlags: Record<string, string> = {
		VN: '🇻🇳',
		JP: '🇯🇵',
		SG: '🇸🇬',
		KR: '🇰🇷',
		IN: '🇮🇳',
		CN: '🇨🇳',
		DE: '🇩🇪',
		GB: '🇬🇧',
		FR: '🇫🇷',
		NL: '🇳🇱',
		PL: '🇵🇱',
		US: '🇺🇸',
		CA: '🇨🇦',
		MX: '🇲🇽',
		BR: '🇧🇷',
		AR: '🇦🇷',
		CL: '🇨🇱',
		ZA: '🇿🇦',
		NG: '🇳🇬',
		EG: '🇪🇬',
		AU: '🇦🇺',
		NZ: '🇳🇿'
	};

	if (location.type === 'continent') {
		return continentEmojis[location.code] ?? '🌐';
	}

	if (location.type === 'country') {
		return countryFlags[location.code] ?? '🏳️';
	}

	const parent = getLocationById(location.parentId ?? '');
	if (parent && parent.type === 'country') {
		return countryFlags[parent.code] ?? '📍';
	}

	return '📍';
}

export function searchLocations(query: string): Location[] {
	const normalizedQuery = query.toLowerCase().trim();
	if (!normalizedQuery) return [];

	return LOCATIONS.filter(
		loc =>
			loc.name.toLowerCase().includes(normalizedQuery) ||
			loc.code.toLowerCase().includes(normalizedQuery) ||
			loc.isps?.some(isp => isp.toLowerCase().includes(normalizedQuery))
	);
}
