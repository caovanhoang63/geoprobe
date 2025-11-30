<script lang="ts">
	interface Props {
		value: string;
		error?: string;
		onChange: (value: string) => void;
	}

	const { value, error, onChange }: Props = $props();

	function handleInput(event: Event): void {
		const target = event.target as HTMLInputElement;
		onChange(target.value);
	}
</script>

<div class="form-field">
	<label for="monitor-url" class="form-label">URL</label>
	<input
		id="monitor-url"
		type="url"
		{value}
		oninput={handleInput}
		placeholder="https://api.example.com/health"
		class="form-input {error ? 'error' : ''}"
		autocomplete="url"
	/>
	{#if error}
		<p class="form-error">{error}</p>
	{/if}
</div>

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

	.form-input.error:focus {
		border-color: #ef4444;
		box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
	}

	.form-error {
		font-size: 12px;
		color: #ef4444;
		margin-top: 6px;
		margin-bottom: 0;
	}
</style>
