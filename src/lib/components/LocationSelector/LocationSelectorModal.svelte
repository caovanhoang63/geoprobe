<script lang="ts">
	import type { Location, SelectedLocation, NetworkFilter, NetworkType } from '$lib/types/location';
	import { LOCATION_COLORS } from '$lib/types/location';
	import {
		getRootLocations,
		getChildLocations,
		getLocationById,
		searchLocations
	} from '$lib/data/locations';

	import LocationCard from './LocationCard.svelte';
	import LocationBadge from './LocationBadge.svelte';
	import LocationSearch from './LocationSearch.svelte';
	import NetworkToggle from './NetworkToggle.svelte';

	interface Props {
		open: boolean;
		selectedLocations: SelectedLocation[];
		onClose: () => void;
		onSelect: (locations: SelectedLocation[]) => void;
	}

	const { open, selectedLocations, onClose, onSelect }: Props = $props();

	let internalSelected = $state<SelectedLocation[]>([]);
	let navigationPath = $state<string[]>([]);
	let searchQuery = $state('');
	let networkFilter = $state<NetworkFilter>('all');

	$effect(() => {
		if (open) {
			internalSelected = [...selectedLocations];
			navigationPath = [];
			searchQuery = '';
			networkFilter = 'all';
		}
	});

	const currentParentId = $derived(navigationPath[navigationPath.length - 1] ?? null);

	const breadcrumbs = $derived.by((): { id: string | null; name: string }[] => {
		const crumbs: { id: string | null; name: string }[] = [{ id: null, name: 'World' }];
		for (const pathId of navigationPath) {
			const loc = getLocationById(pathId);
			if (loc) {
				crumbs.push({ id: loc.id, name: loc.name });
			}
		}
		return crumbs;
	});

	const visibleLocations = $derived.by((): Location[] => {
		if (searchQuery.trim()) {
			return searchLocations(searchQuery);
		}

		const locs = currentParentId ? getChildLocations(currentParentId) : getRootLocations();
		return locs;
	});

	const filteredLocations = $derived.by((): Location[] => {
		if (networkFilter === 'all') {
			return visibleLocations;
		}
		return visibleLocations.filter((loc) => loc.networkTypes.includes(networkFilter as NetworkType));
	});

	function isLocationSelected(locationId: string): boolean {
		return internalSelected.some((sel) => sel.location.id === locationId);
	}

	function getNextColor(): string {
		const usedColors = new Set(internalSelected.map((sel) => sel.color));
		const availableColor = LOCATION_COLORS.find((c) => !usedColors.has(c));
		return availableColor ?? LOCATION_COLORS[internalSelected.length % LOCATION_COLORS.length] ?? '#10b981';
	}

	function handleCardClick(location: Location): void {
		const hasChildren = getChildLocations(location.id).length > 0;

		if (hasChildren) {
			navigationPath = [...navigationPath, location.id];
			searchQuery = '';
		} else {
			toggleLocationSelection(location);
		}
	}

	function toggleLocationSelection(location: Location): void {
		const existingIndex = internalSelected.findIndex((sel) => sel.location.id === location.id);

		if (existingIndex >= 0) {
			internalSelected = internalSelected.filter((_, i) => i !== existingIndex);
		} else {
			const newSelection: SelectedLocation = {
				location,
				networkType: networkFilter === 'all' ? 'any' : networkFilter,
				color: getNextColor()
			};
			internalSelected = [...internalSelected, newSelection];
		}
	}

	function handleRemoveSelected(locationId: string): void {
		internalSelected = internalSelected.filter((sel) => sel.location.id !== locationId);
	}

	function handleBreadcrumbClick(targetId: string | null): void {
		if (targetId === null) {
			navigationPath = [];
		} else {
			const idx = navigationPath.indexOf(targetId);
			if (idx >= 0) {
				navigationPath = navigationPath.slice(0, idx + 1);
			}
		}
		searchQuery = '';
	}

	function handleSearchChange(query: string): void {
		searchQuery = query;
	}

	function handleNetworkFilterChange(filter: NetworkFilter): void {
		networkFilter = filter;
	}

	function handleConfirm(): void {
		onSelect(internalSelected);
		onClose();
	}

	function handleCancel(): void {
		onClose();
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			handleCancel();
		}
	}

	function handleBackdropClick(event: MouseEvent): void {
		if (event.target === event.currentTarget) {
			handleCancel();
		}
	}
</script>

<svelte:window onkeydown={open ? handleKeydown : undefined} />

{#if open}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		aria-labelledby="location-modal-title"
		tabindex="-1"
	>
		<div
			class="w-full max-w-4xl max-h-[90vh] bg-[#1a1d21] rounded-2xl border border-[#2d3139] shadow-2xl flex flex-col overflow-hidden"
		>
			<header
				class="flex items-center justify-between px-6 py-4 border-b border-[#2d3139] flex-shrink-0"
			>
				<h2 id="location-modal-title" class="text-xl font-semibold text-[#e8eaed]">
					Select Locations
				</h2>
				<button
					type="button"
					onclick={handleCancel}
					class="w-8 h-8 rounded-lg flex items-center justify-center text-[#9ca3af] hover:text-[#e8eaed] hover:bg-[#2a2f38] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
					aria-label="Close modal"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="w-5 h-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</header>

			<div class="flex items-center gap-4 px-6 py-3 border-b border-[#2d3139] flex-shrink-0">
				<LocationSearch query={searchQuery} onSearch={handleSearchChange} />
				<NetworkToggle value={networkFilter} onChange={handleNetworkFilterChange} />
			</div>

			{#if !searchQuery.trim()}
				<nav class="px-6 py-2 border-b border-[#2d3139] flex-shrink-0" aria-label="Breadcrumb">
					<ol class="flex items-center gap-1 text-sm">
						{#each breadcrumbs as crumb, index (crumb.id ?? 'root')}
							{#if index > 0}
								<li class="text-[#6b7280]" aria-hidden="true">/</li>
							{/if}
							<li>
								{#if index === breadcrumbs.length - 1}
									<span class="text-[#e8eaed] font-medium">{crumb.name}</span>
								{:else}
									<button
										type="button"
										onclick={() => handleBreadcrumbClick(crumb.id)}
										class="text-[#9ca3af] hover:text-[#10b981] transition-colors duration-150 focus:outline-none focus:underline"
									>
										{crumb.name}
									</button>
								{/if}
							</li>
						{/each}
					</ol>
				</nav>
			{/if}

			<div class="flex-1 overflow-y-auto p-6 min-h-0">
				{#if filteredLocations.length === 0}
					<div class="flex flex-col items-center justify-center py-12 text-center">
						<span class="text-4xl mb-3">🔍</span>
						<p class="text-[#9ca3af]">No locations found</p>
						{#if searchQuery.trim()}
							<p class="text-sm text-[#6b7280] mt-1">Try a different search term</p>
						{/if}
					</div>
				{:else}
					<div class="flex flex-wrap gap-4">
						{#each filteredLocations as location (location.id)}
							<LocationCard
								{location}
								selected={isLocationSelected(location.id)}
								onclick={() => handleCardClick(location)}
							/>
						{/each}
					</div>
				{/if}
			</div>

			{#if internalSelected.length > 0}
				<div class="px-6 py-3 border-t border-[#2d3139] flex-shrink-0">
					<div class="flex items-center gap-2 mb-2">
						<span class="text-sm font-medium text-[#9ca3af]">Selected:</span>
						<span class="text-xs text-[#6b7280]">({internalSelected.length})</span>
					</div>
					<div class="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
						{#each internalSelected as selected (selected.location.id)}
							<LocationBadge
								location={selected}
								onRemove={() => handleRemoveSelected(selected.location.id)}
							/>
						{/each}
					</div>
				</div>
			{/if}

			<footer
				class="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#2d3139] bg-[#1e2228] flex-shrink-0"
			>
				<button
					type="button"
					onclick={handleCancel}
					class="px-4 py-2.5 rounded-lg text-sm font-medium text-[#9ca3af] bg-transparent border border-[#363b45] hover:text-[#e8eaed] hover:bg-[#2a2f38] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
				>
					Cancel
				</button>
				<button
					type="button"
					onclick={handleConfirm}
					class="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#10b981] hover:bg-[#0fd89e] hover:shadow-[0_4px_12px_rgba(16,185,129,0.3)] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:ring-offset-2 focus:ring-offset-[#1e2228]"
				>
					Confirm ({internalSelected.length})
				</button>
			</footer>
		</div>
	</div>
{/if}
