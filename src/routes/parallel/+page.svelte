<script lang="ts">
	import { type WorkerAction } from '$lib/worker/types';
	import { initialParameters } from '$lib/stores/parameter/ParameterStore';
	import { WorkerPool } from '$lib/worker/pool';
	import { readable } from 'svelte/store';
	import { Algorithms } from '$lib/const';
	import { adapter, quadrealroot } from '$lib/utils';
	import type { ParameterInput } from '$lib/stores/parameter/types';

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

	function mttc(params: ParameterInput) {
		const { FV, LV } = params;
		const roots = quadrealroot(0.5 * (FV.ax - LV.ax), FV.vx - LV.vx, -params.Sim.id);
		if (isNaN(roots[0])) return Number.NEGATIVE_INFINITY;
		const minroot = Math.min(...roots.filter((n) => n > 0));
		if (!isFinite(minroot)) return Number.NEGATIVE_INFINITY;
		return minroot;
	}

	function test() {
		const test = structuredClone(initialParameters);
		test.FV.vx = 3;
		test.LV.vx = 5.709030100334492;
		test.FV.ax = -9.732441471571903;
		test.Sim.id = 0.2401337792641174;
		console.log(mttc(test));
	}
	test();

	function start() {
		// for (const time of [15, 5, 15, 2, 3]) {
		// 	const clone = structuredClone(defaultTask);
		// 	clone.params.maxElapsedTimeInSeconds = time;

		// 	workers.dispatch(clone).then(console.log);
		// }
		for (const vf of [3]) //, 6, 12, 18, 36])
			for (const dA of linspace(-XLIM, XLIM, GRAN))
				for (const dV of linspace(-YLIM, YLIM, GRAN)) {
					const clone = structuredClone(defaultTask);
					clone.simParams.FV.vx = vf;
					clone.simParams.LV.vx = vf - dV;
					clone.simParams.FV.ax = dA;
					clone.simParams.Sim.id = Algorithms[clone.fcwaKey](adapter(clone.simParams));

					if (dV > vf || clone.simParams.Sim.id < 0 || mttc(clone.simParams) <= 0) {
						// console.warn('Skipping');
						continue;
					}

					workers.dispatch(clone).then(console.log);
				}
		allDispatched = true;
	}

	let allDispatched = false;
</script>

Results:
<div class="flex flex-col gap-2">
	<button on:click={start}> Start </button>
	{#each Object.entries($display) as [id, worker]}
		<h1>Worker #{id}: {worker.status}</h1>
	{/each}
	{#if allDispatched}
		<h1>All tasks dispatched! Please wait for remaining workers to finish</h1>
	{/if}
</div>
