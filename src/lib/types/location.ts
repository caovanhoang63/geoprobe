export type LocationType = 'continent' | 'country' | 'city';
export type NetworkType = 'residential' | 'datacenter';
export type NetworkFilter = 'all' | 'residential' | 'datacenter';

export interface Location {
	id: string;
	type: LocationType;
	name: string;
	code: string;
	parentId?: string;
	networkTypes: NetworkType[];
	isps?: string[];
	probeCount?: number;
}

export interface SelectedLocation {
	location: Location;
	networkType: NetworkType | 'any';
	isp?: string;
	color: string;
}

export const LOCATION_COLORS: readonly string[] = [
	'#10b981',
	'#3b82f6',
	'#f59e0b',
	'#ef4444',
	'#8b5cf6',
	'#ec4899',
	'#06b6d4',
	'#84cc16'
] as const;
