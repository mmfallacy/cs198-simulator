<script lang="ts">
	import { type WorkerAction } from '$lib/worker/types';
	import { initialParameters } from '$lib/stores/parameter/ParameterStore';
	import { WorkerPool, type PoolEntry } from '$lib/worker/utils';
	import { readable } from 'svelte/store';

	const tasks = new Array<WorkerAction>();

	const defaultTask: WorkerAction = {
		simParams: initialParameters,
		fcwaKey: 'honda',
		params: {
			maxDistanceInMeters: 1000
		}
	};

	defaultTask.simParams.Sim.tps = 120;

	const XLIM = 10,
		YLIM = 30,
		GRAN = 300;

	// Derived from numpy's `linspace` function
	// https://github.com/numpy/numpy/blob/v1.26.0/numpy/core/function_base.py#L24-L182
	function* linspace(start: number, stop: number, gran: number) {
		const delta = stop - start;
		const div = gran - 1;
		while (start < stop) {
			start += delta / div;
			yield start;
		}
	}

	const workers = new WorkerPool(14);

	const display = readable(workers.pool, function (set) {
		workers.subscribe(set);
	});

	function start() {
		// for (const time of [15, 5, 15, 2, 3]) {
		// 	const clone = structuredClone(defaultTask);
		// 	clone.params.maxElapsedTimeInSeconds = time;

		// 	workers.dispatch(clone).then(console.log);
		// }
		for (const vf of [3, 6, 12, 18, 36])
			for (const dA of linspace(-XLIM, XLIM, GRAN))
				for (const dV of linspace(-YLIM, YLIM, GRAN)) {
					const clone = structuredClone(defaultTask);
					clone.simParams.FV.vx = vf;
					clone.simParams.LV.vx = vf - dV;
					clone.simParams.FV.ax = dA;
					workers.dispatch(clone).then(console.log);
				}
	}
</script>

Results:
<div class="flex flex-col gap-2">
	<button on:click={start}> Start </button>
	{#each Object.entries($display) as [id, worker]}
		<h1>Worker #{id}: {worker.status}</h1>
	{/each}
</div>
