<script lang="ts">
	import { db } from '$lib/database/database';
	import { liveQuery } from 'dexie';
	import { exportDB } from 'dexie-export-import';

	let runs = get();
	$: runs = get();
	let offset = 0;

	const PAGE_SIZE = 25;

	function get() {
		// return liveQuery(async () => {
		// 	const collection = db.runs;
		// 	return await collection.offset(offset).limit(PAGE_SIZE).toArray();
		// });
	}

	async function exp() {
		const blob = await exportDB(db);
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'export.json';
		a.click();
		URL.revokeObjectURL(url);
	}

	$: console.log($runs);
</script>

{#if $runs}
	{#each $runs as run (run.params)}
		{#each Object.entries(run) as [key, value]}
			{key}: {value}
		{/each}
	{/each}
{/if}
<button on:click={exp}>Export DB</button>
