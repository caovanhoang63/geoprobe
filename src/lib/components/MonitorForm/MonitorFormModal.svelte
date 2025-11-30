<script lang="ts">
	import type { SelectedLocation } from '$lib/types/location';
	import type { MonitorFormData, MonitorFormMode, MonitorEditData } from '$lib/types/monitor-form';
	import { DEFAULT_INTERVAL } from '$lib/types/monitor-form';

	import UrlInput from './UrlInput.svelte';
	import IntervalSelector from './IntervalSelector.svelte';
	import LocationsField from './LocationsField.svelte';
	import NotificationSettings from './NotificationSettings.svelte';
	import DeleteConfirmModal from './DeleteConfirmModal.svelte';

	interface Props {
		open: boolean;
		mode: MonitorFormMode;
		monitor?: MonitorEditData;
		onClose: () => void;
		onSave: (data: MonitorFormData) => void;
		onDelete?: () => void;
	}

	const { open, mode, monitor, onClose, onSave, onDelete }: Props = $props();

	let formName = $state('');
	let formUrl = $state('');
	let formInterval = $state(DEFAULT_INTERVAL);
	let formLocations = $state<SelectedLocation[]>([]);
	let formDiscordWebhook = $state('');
	let deleteModalOpen = $state(false);

	$effect(() => {
		if (open) {
			if (mode === 'edit' && monitor) {
				formName = monitor.name;
				formUrl = monitor.url;
				formInterval = monitor.interval;
				formLocations = [...monitor.locations];
				formDiscordWebhook = monitor.discordWebhook ?? '';
			} else {
				formName = '';
				formUrl = '';
				formInterval = DEFAULT_INTERVAL;
				formLocations = [];
				formDiscordWebhook = '';
			}
			deleteModalOpen = false;
		}
	});

	const modalTitle = $derived(mode === 'create' ? 'Create Monitor' : 'Edit Monitor');

	const nameError = $derived.by((): string | undefined => {
		if (!formName.trim()) return 'Name is required';
		if (formName.trim().length < 2) return 'Name must be at least 2 characters';
		return undefined;
	});

	const urlError = $derived.by((): string | undefined => {
		if (!formUrl.trim()) return 'URL is required';
		try {
			const url = new URL(formUrl.trim());
			if (!['http:', 'https:'].includes(url.protocol)) {
				return 'URL must start with http:// or https://';
			}
			return undefined;
		} catch {
			return 'Please enter a valid URL';
		}
	});

	const isFormValid = $derived(!nameError && !urlError && formLocations.length > 0);

	function handleNameChange(event: Event): void {
		const target = event.target as HTMLInputElement;
		formName = target.value;
	}

	function handleUrlChange(value: string): void {
		formUrl = value;
	}

	function handleIntervalChange(value: number): void {
		formInterval = value;
	}

	function handleLocationsChange(locations: SelectedLocation[]): void {
		formLocations = locations;
	}

	function handleWebhookChange(webhook: string): void {
		formDiscordWebhook = webhook;
	}

	function handleSave(): void {
		if (!isFormValid) return;

		const data: MonitorFormData = {
			name: formName.trim(),
			url: formUrl.trim(),
			interval: formInterval,
			locations: formLocations,
			discordWebhook: formDiscordWebhook.trim() || undefined
		};

		onSave(data);
	}

	function handleDeleteClick(): void {
		deleteModalOpen = true;
	}

	function handleDeleteConfirm(): void {
		deleteModalOpen = false;
		onDelete?.();
	}

	function handleDeleteCancel(): void {
		deleteModalOpen = false;
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape' && !deleteModalOpen) {
			onClose();
		}
	}

	function handleBackdropClick(event: MouseEvent): void {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={open ? handleKeydown : undefined} />

{#if open}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="modal-backdrop"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		aria-labelledby="monitor-form-title"
		tabindex="-1"
	>
		<div class="modal-container">
			<header class="modal-header">
				<h2 id="monitor-form-title" class="modal-title">{modalTitle}</h2>
				<button
					type="button"
					onclick={onClose}
					class="close-btn"
					aria-label="Close modal"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="close-icon"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</header>

			<div class="modal-body">
				<div class="form-field">
					<label for="monitor-name" class="form-label">Name</label>
					<input
						id="monitor-name"
						type="text"
						value={formName}
						oninput={handleNameChange}
						placeholder="Production API"
						class="form-input {nameError && formName ? 'error' : ''}"
						autocomplete="off"
					/>
					{#if nameError && formName}
						<p class="form-error">{nameError}</p>
					{/if}
				</div>

				<UrlInput value={formUrl} error={formUrl ? urlError : undefined} onChange={handleUrlChange} />

				<IntervalSelector value={formInterval} onChange={handleIntervalChange} />

				<LocationsField selectedLocations={formLocations} onChange={handleLocationsChange} />

				{#if formLocations.length === 0}
					<p class="location-hint">Please select at least one monitoring location</p>
				{/if}

				<NotificationSettings discordWebhook={formDiscordWebhook} onChange={handleWebhookChange} />
			</div>

			<footer class="modal-footer">
				{#if mode === 'edit' && onDelete}
					<button type="button" class="btn-delete" onclick={handleDeleteClick}>
						Delete
					</button>
				{/if}
				<div class="footer-actions">
					<button type="button" class="btn-cancel" onclick={onClose}>
						Cancel
					</button>
					<button
						type="button"
						class="btn-save"
						onclick={handleSave}
						disabled={!isFormValid}
					>
						{mode === 'create' ? 'Create Monitor' : 'Save Changes'}
					</button>
				</div>
			</footer>
		</div>
	</div>
{/if}

<DeleteConfirmModal
	open={deleteModalOpen}
	monitorName={formName || monitor?.name || 'this monitor'}
	onConfirm={handleDeleteConfirm}
	onCancel={handleDeleteCancel}
/>

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px;
		background-color: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
	}

	.modal-container {
		width: 100%;
		max-width: 640px;
		max-height: 90vh;
		background-color: #1a1d21;
		border-radius: 16px;
		border: 1px solid #2d3139;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 24px;
		border-bottom: 1px solid #2d3139;
		flex-shrink: 0;
	}

	.modal-title {
		font-size: 20px;
		font-weight: 600;
		color: #e8eaed;
		margin: 0;
	}

	.close-btn {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		color: #9ca3af;
		cursor: pointer;
		transition: all 150ms ease;
	}

	.close-btn:hover {
		background-color: #2a2f38;
		color: #e8eaed;
	}

	.close-btn:focus {
		outline: none;
		box-shadow: 0 0 0 2px #10b981;
	}

	.close-icon {
		width: 20px;
		height: 20px;
	}

	.modal-body {
		flex: 1;
		overflow-y: auto;
		padding: 24px;
		background-color: #242830;
	}

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

	.form-input {
		width: 100%;
		padding: 12px 16px;
		background-color: #2a2f38;
		border: 1px solid #363b45;
		border-radius: 8px;
		color: #e8eaed;
		font-size: 14px;
		transition: all 150ms ease;
	}

	.form-input::placeholder {
		color: #6b7280;
	}

	.form-input:focus {
		outline: none;
		border-color: #10b981;
		box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
	}

	.form-input.error {
		border-color: #ef4444;
	}

	.form-error {
		font-size: 12px;
		color: #ef4444;
		margin-top: 6px;
		margin-bottom: 0;
	}

	.location-hint {
		font-size: 12px;
		color: #f59e0b;
		margin-top: -16px;
		margin-bottom: 24px;
	}

	.modal-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 24px;
		border-top: 1px solid #2d3139;
		background-color: #1e2228;
		flex-shrink: 0;
	}

	.footer-actions {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-left: auto;
	}

	.btn-cancel {
		padding: 10px 20px;
		background-color: transparent;
		border: 1px solid #363b45;
		border-radius: 8px;
		color: #9ca3af;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 150ms ease;
	}

	.btn-cancel:hover {
		background-color: #2a2f38;
		color: #e8eaed;
	}

	.btn-cancel:focus {
		outline: none;
		box-shadow: 0 0 0 2px #10b981;
	}

	.btn-save {
		padding: 10px 20px;
		background-color: #10b981;
		border: none;
		border-radius: 8px;
		color: white;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 150ms ease;
	}

	.btn-save:hover:not(:disabled) {
		background-color: #0fd89e;
		box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
	}

	.btn-save:focus {
		outline: none;
		box-shadow: 0 0 0 2px #10b981, 0 0 0 4px rgba(16, 185, 129, 0.2);
	}

	.btn-save:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-delete {
		padding: 10px 20px;
		background-color: transparent;
		border: 1px solid #ef4444;
		border-radius: 8px;
		color: #ef4444;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 150ms ease;
	}

	.btn-delete:hover {
		background-color: #ef4444;
		color: white;
	}

	.btn-delete:focus {
		outline: none;
		box-shadow: 0 0 0 2px #ef4444;
	}
</style>
