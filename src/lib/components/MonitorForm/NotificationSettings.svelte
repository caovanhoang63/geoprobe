<script lang="ts">
	interface Props {
		discordWebhook: string;
		onChange: (webhook: string) => void;
	}

	const { discordWebhook, onChange }: Props = $props();

	const webhookError = $derived.by((): string | undefined => {
		if (!discordWebhook) return undefined;
		const trimmed = discordWebhook.trim();
		if (!trimmed) return undefined;
		const discordPattern = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/;
		const discordablePattern = /^https:\/\/discordapp\.com\/api\/webhooks\/\d+\/[\w-]+$/;
		if (!discordPattern.test(trimmed) && !discordablePattern.test(trimmed)) {
			return 'Invalid Discord webhook URL format';
		}
		return undefined;
	});

	function handleInput(event: Event): void {
		const target = event.target as HTMLInputElement;
		onChange(target.value);
	}
</script>

<div class="form-field">
	<div class="field-header">
		<label for="discord-webhook" class="form-label">Discord Webhook</label>
		<span class="optional-tag">Optional</span>
	</div>
	<p class="field-description">Receive notifications when your monitor goes down or recovers.</p>
	<input
		id="discord-webhook"
		type="url"
		value={discordWebhook}
		oninput={handleInput}
		placeholder="https://discord.com/api/webhooks/..."
		class="form-input {webhookError ? 'error' : ''}"
		autocomplete="off"
	/>
	{#if webhookError}
		<p class="form-error">{webhookError}</p>
	{/if}
</div>

<style>
	.form-field {
		margin-bottom: 24px;
	}

	.field-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 4px;
	}

	.form-label {
		font-size: 13px;
		font-weight: 500;
		color: #9ca3af;
		margin-bottom: 0;
	}

	.optional-tag {
		font-size: 11px;
		color: #6b7280;
		background-color: #2a2f38;
		padding: 2px 6px;
		border-radius: 4px;
	}

	.field-description {
		font-size: 12px;
		color: #6b7280;
		margin-top: 0;
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
