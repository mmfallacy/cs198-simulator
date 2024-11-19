<script lang="ts">
	import { db } from '$lib/database/database';
	import { exportDB } from 'dexie-export-import';

	async function exp() {
		const blob = await exportDB(db);
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${filename}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}

	let filename: string = 'export';
</script>

<input type="text" bind:value={filename} placeholder="place filename here" />
<button on:click={exp}>Export DB</button>
