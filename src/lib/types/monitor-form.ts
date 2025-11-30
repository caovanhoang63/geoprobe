import type { SelectedLocation } from './location';

export interface MonitorFormData {
	name: string;
	url: string;
	interval: number;
	locations: SelectedLocation[];
	discordWebhook?: string;
}

export interface MonitorEditData {
	id: string;
	name: string;
	url: string;
	interval: number;
	locations: SelectedLocation[];
	discordWebhook?: string;
}

export type MonitorFormMode = 'create' | 'edit';

export interface IntervalOption {
	label: string;
	value: number;
}

export const INTERVAL_OPTIONS: IntervalOption[] = [
	{ label: '1 min', value: 60 },
	{ label: '2 min', value: 120 },
	{ label: '5 min', value: 300 },
	{ label: '10 min', value: 600 },
	{ label: '30 min', value: 1800 },
	{ label: '1 hour', value: 3600 }
];

export const DEFAULT_INTERVAL = 300;
