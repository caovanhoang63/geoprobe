<script lang="ts">
	interface Props {
		open: boolean;
		monitorName: string;
		onConfirm: () => void;
		onCancel: () => void;
	}

	const { open, monitorName, onConfirm, onCancel }: Props = $props();

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			onCancel();
		}
	}

	function handleBackdropClick(event: MouseEvent): void {
		if (event.target === event.currentTarget) {
			onCancel();
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
		aria-labelledby="delete-modal-title"
		tabindex="-1"
	>
		<div class="modal-container">
			<div class="modal-icon">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="icon"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
			</div>

			<h3 id="delete-modal-title" class="modal-title">Delete Monitor</h3>

			<p class="modal-message">
				Are you sure you want to delete <strong>{monitorName}</strong>? This action cannot be undone
				and all historical data will be permanently removed.
			</p>

			<div class="modal-actions">
				<button type="button" class="btn-cancel" onclick={onCancel}> Cancel </button>
				<button type="button" class="btn-delete" onclick={onConfirm}> Delete Monitor </button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		z-index: 60;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px;
		background-color: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(4px);
	}

	.modal-container {
		width: 100%;
		max-width: 400px;
		background-color: #1a1d21;
		border-radius: 16px;
		border: 1px solid #2d3139;
		padding: 24px;
		text-align: center;
	}

	.modal-icon {
		width: 48px;
		height: 48px;
		margin: 0 auto 16px;
		background-color: rgba(239, 68, 68, 0.15);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon {
		width: 24px;
		height: 24px;
		color: #ef4444;
	}

	.modal-title {
		font-size: 18px;
		font-weight: 600;
		color: #e8eaed;
		margin: 0 0 12px;
	}

	.modal-message {
		font-size: 14px;
		color: #9ca3af;
		line-height: 1.5;
		margin: 0 0 24px;
	}

	.modal-message strong {
		color: #e8eaed;
	}

	.modal-actions {
		display: flex;
		gap: 12px;
		justify-content: center;
	}

	.btn-cancel {
		flex: 1;
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

	.btn-delete {
		flex: 1;
		padding: 10px 20px;
		background-color: #ef4444;
		border: none;
		border-radius: 8px;
		color: white;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 150ms ease;
	}

	.btn-delete:hover {
		background-color: #dc2626;
	}

	.btn-delete:focus {
		outline: none;
		box-shadow: 0 0 0 2px #ef4444;
	}
</style>
