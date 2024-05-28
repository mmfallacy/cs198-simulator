<script lang="ts">
	import { type WorkerAction } from '$lib/worker/types';
	import Task from '$lib/components/Task.svelte';
	import { initialParameters } from '$lib/stores/parameter/ParameterStore';

	const tasks: Array<WorkerAction> = [
		{
			simParams: initialParameters,
			fcwaKey: 'honda',
			params: {
				maxDistanceInMeters: 500
			}
		},

		{
			simParams: initialParameters,
			fcwaKey: 'hirstgraham',
			params: {
				maxDistanceInMeters: 500
			}
		},

		{
			simParams: initialParameters,
			fcwaKey: 'bellarusso',
			params: {
				maxDistanceInMeters: 500
			}
		}
	];
</script>

Results:
<div class="flex flex-col gap-2">
	{#each tasks as task}
		<Task workerAction={task} />
	{/each}
</div>
