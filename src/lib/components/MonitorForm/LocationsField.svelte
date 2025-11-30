<script lang="ts">
	import type { SelectedLocation } from '$lib/types/location';
	import LocationSelectorModal from '$lib/components/LocationSelector/LocationSelectorModal.svelte';
	import LocationBadge from '$lib/components/LocationSelector/LocationBadge.svelte';

	interface Props {
		selectedLocations: SelectedLocation[];
		onChange: (locations: SelectedLocation[]) => void;
	}

	const { selectedLocations, onChange }: Props = $props();

	let selectorOpen = $state(false);

	const locationCount = $derived(selectedLocations.length);
	const buttonText = $derived(
		locationCount === 0
			? 'Select Locations'
			: `${locationCount} location${locationCount !== 1 ? 's' : ''} selected`
	);

	function handleOpenSelector(): void {
		selectorOpen = true;
	}

	function handleCloseSelector(): void {
		selectorOpen = false;
	}

	function handleLocationsSelect(locations: SelectedLocation[]): void {
		onChange(locations);
	}

	function handleRemoveLocation(locationId: string): void {
		const filtered = selectedLocations.filter((sel) => sel.location.id !== locationId);
		onChange(filtered);
	}
</script>

<div class="form-field">
	<span id="locations-label" class="form-label">Monitoring Locations</span>
	<button type="button" class="location-trigger" aria-labelledby="locations-label" onclick={handleOpenSelector}>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="trigger-icon"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
			/>
			<path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
		</svg>
		<span class="trigger-text">{buttonText}</span>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="chevron-icon"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	{#if locationCount > 0}
		<div class="selected-locations">
			{#each selectedLocations as selected (selected.location.id)}
				<LocationBadge location={selected} onRemove={() => handleRemoveLocation(selected.location.id)} />
			{/each}
		</div>
	{/if}
</div>

<LocationSelectorModal
	open={selectorOpen}
	{selectedLocations}
	onClose={handleCloseSelector}
	onSelect={handleLocationsSelect}
/>

<style>
	.form-field {
		margin-bottom: 24px;
	}

	.form-label {
		display: block;
		font-size: 13px;
		font-weight: 500;
		color: #9ca3af;
		margin-bottom: 8px;
	}

	.location-trigger {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		background-color: #2a2f38;
		border: 1px solid #363b45;
		border-radius: 8px;
		color: #e8eaed;
		font-size: 14px;
		cursor: pointer;
		transition: all 150ms ease;
	}

	.location-trigger:hover {
		background-color: #363b45;
	}

	.location-trigger:focus {
		outline: none;
		border-color: #10b981;
		box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
	}

	.trigger-icon {
		width: 18px;
		height: 18px;
		color: #9ca3af;
		flex-shrink: 0;
	}

	.trigger-text {
		flex: 1;
		text-align: left;
	}

	.chevron-icon {
		width: 16px;
		height: 16px;
		color: #6b7280;
		flex-shrink: 0;
	}

	.selected-locations {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 12px;
	}
</style>
