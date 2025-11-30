<script lang="ts">
	interface Props {
		onPause: () => void;
		onEdit: () => void;
		onDelete: () => void;
	}

	const { onPause, onEdit, onDelete }: Props = $props();
</script>

<div class="flex gap-3">
	<button
		onclick={onPause}
		class="px-4 py-2 text-sm font-medium text-[#9ca3af] bg-transparent border border-[#3a3f4a] rounded-md flex items-center gap-1.5 transition-all duration-150 hover:bg-[#2a2f38] hover:border-[#4a5160] hover:text-[#e8eaed]"
	>
		<span>⏸</span>
		<span>Pause</span>
	</button>

	<button
		onclick={onEdit}
		class="px-4 py-2 text-sm font-medium text-[#9ca3af] bg-transparent border border-[#3a3f4a] rounded-md flex items-center gap-1.5 transition-all duration-150 hover:bg-[#2a2f38] hover:border-[#4a5160] hover:text-[#e8eaed]"
	>
		<span>✏</span>
		<span>Edit</span>
	</button>

	<button
		onclick={onDelete}
		class="px-4 py-2 text-sm font-medium text-white bg-[#ef4444] rounded-md flex items-center gap-1.5 transition-all duration-150 hover:bg-[#dc2626] hover:shadow-[0_2px_8px_rgba(239,68,68,0.3)]"
	>
		<span>🗑</span>
		<span>Delete</span>
	</button>
</div>
