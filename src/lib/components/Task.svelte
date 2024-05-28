<script lang="ts">
	import type { DeepReadonly } from '$lib/utils';
	import { WorkerActionSchema, WorkerReturnSchema, type WorkerAction } from '$lib/worker/types';
	import { createWorkerAndRun } from '$lib/worker/utils';
	import { onMount } from 'svelte';
	import * as v from 'valibot';

	export let workerAction: DeepReadonly<WorkerAction>;

	onMount(() => {
		console.log('received ', workerAction);
	});
</script>

{#await createWorkerAndRun(v.parse(WorkerActionSchema, workerAction))}
	<div class="flex items-center justify-between">
		<span>Loading...</span>
	</div>
{:then result}
	{@const { FV, LV, ...Metrics } = v.parse(WorkerReturnSchema, result)}
	<div class="flex gap-2 bg-blue-100 p-2">
		<div class="grid grid-cols-[max-content_auto] gap-2">
			<span class="col-span-full font-bold">FV</span>
			{#each Object.entries(FV) as [key, value]}
				<h4>{key}</h4>
				<p>{value}</p>
			{/each}
		</div>

		<div class="grid grid-cols-[max-content_auto] gap-2">
			<span class="col-span-full font-bold">LV</span>
			{#each Object.entries(LV) as [key, value]}
				<h4>{key}</h4>
				<p>{value}</p>
			{/each}
		</div>

		<div class="grid grid-cols-[max-content_auto] gap-2">
			<span class="col-span-full font-bold">Metrics</span>
			{#each Object.entries(Metrics) as [key, value]}
				<h4>{key}</h4>
				<p>{value}</p>
			{/each}
		</div>
	</div>
{:catch error}
	{console.error(error)}
{/await}
