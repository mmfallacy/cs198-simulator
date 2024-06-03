<script lang="ts">
	import { type WorkerAction } from '$lib/worker/types';
	import Task from '$lib/components/Task.svelte';
	import { initialParameters } from '$lib/stores/parameter/ParameterStore';

	const tasks = new Array<WorkerAction>();

	const defaultTask: WorkerAction = {
		simParams: initialParameters,
		fcwaKey: 'honda',
		params: {
			maxDistanceInMeters: 1000
		}
	};

	defaultTask.simParams.Sim.tps = 2000;

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

	// for (const vf of [3, 6, 12, 18, 36])
	const vf = 3;
	for (const dA of linspace(-XLIM, XLIM, GRAN))
		for (const dV of linspace(-YLIM, YLIM, GRAN)) {
			defaultTask.simParams.FV.vx = vf;
			defaultTask.simParams.LV.vx = vf - dV;
			defaultTask.simParams.FV.ax = dA;
			tasks.push(defaultTask);
		}
</script>

Results:
<div class="flex flex-col gap-2">
	{#each tasks as task}
		<Task workerAction={task} />
	{/each}
</div>
