<script lang="ts">
	import { db } from '$lib/database/database';
	import { liveQuery } from 'dexie';

	let runs = get();
	$: runs = get();
	let offset = 0;

	const PAGE_SIZE = 25;

	function get() {
		return liveQuery(async () => {
			const collection = db.runs;
			return (await collection.offset(offset).limit(PAGE_SIZE).toArray()).map((result) => {
				result.params = JSON.parse(result.params);
				return result;
			});
		});
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
