<script lang="ts">
	import { INTERVAL_OPTIONS } from '$lib/types/monitor-form';

	interface Props {
		value: number;
		onChange: (value: number) => void;
	}

	const { value, onChange }: Props = $props();

	function handleSelect(intervalValue: number): void {
		onChange(intervalValue);
	}
</script>

<div class="form-field">
	<span id="interval-label" class="form-label">Check Interval</span>
	<div class="interval-group" role="radiogroup" aria-labelledby="interval-label">
		{#each INTERVAL_OPTIONS as option (option.value)}
			<button
				type="button"
				class="interval-pill {value === option.value ? 'active' : ''}"
				onclick={() => handleSelect(option.value)}
				role="radio"
				aria-checked={value === option.value}
			>
				{option.label}
			</button>
		{/each}
	</div>
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

	.interval-group {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.interval-pill {
		padding: 8px 16px;
		background-color: #2a2f38;
		border: 1px solid #363b45;
		border-radius: 20px;
		color: #9ca3af;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: all 150ms ease;
	}

	.interval-pill:hover {
		background-color: #363b45;
		color: #e8eaed;
	}

	.interval-pill:focus {
		outline: none;
		box-shadow: 0 0 0 2px #10b981;
	}

	.interval-pill.active {
		background-color: #10b981;
		border-color: #10b981;
		color: white;
	}

	.interval-pill.active:hover {
		background-color: #0fd89e;
		border-color: #0fd89e;
	}
</style>
