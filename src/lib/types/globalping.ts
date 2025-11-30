export interface LocationFilter {
	country?: string;
	continent?: string;
	city?: string;
	tags?: string[];
}

export interface GlobalpingRequest {
	type: 'http';
	target: string;
	locations: LocationFilter[];
	measurementOptions?: {
		protocol?: 'http' | 'https';
		port?: number;
		request?: {
			path?: string;
			host?: string;
			headers?: Record<string, string>;
		};
	};
}

export interface GlobalpingResponse {
	id: string;
	status: 'in-progress' | 'completed' | 'failed';
	type: string;
	target: string;
	results?: ProbeResult[];
}

export interface ProbeResult {
	probe: {
		country: string;
		city: string;
		continent: string;
		tags: string[];
	};
	result: {
		status: 'finished' | 'failed';
		statusCode?: number;
		timings?: {
			total: number;
			firstByte: number;
			download: number;
		};
		rawError?: string;
	};
}
