<script lang="ts">
	import { type WorkerAction } from '$lib/worker/types';
	import { initialParameters } from '$lib/stores/parameter/ParameterStore';
	import { WorkerPool } from '$lib/worker/pool';
	import { readable } from 'svelte/store';
	import { Algorithms } from '$lib/const';
	import { adapter, linspace, quadrealroot } from '$lib/utils';
	import type { ParameterInput } from '$lib/stores/parameter/types';
	import { assert } from '$lib/assert';

	const XLIM = 10,
		YLIM = 30,
		GRAN = 300;

	const dAspace = Array.from(linspace(-XLIM, XLIM, GRAN)),
		dVspace = Array.from(linspace(-YLIM, YLIM, GRAN)),
		vfspace = [3, 12, 24];

	type ValidAlgorithm = keyof typeof Algorithms;

	const algorithms: ValidAlgorithm[] = ['honda', 'hirstgraham', 'bellarusso', 'onecar'];

	const tasks = $state(
		algorithms.flatMap((fcwa) =>
			vfspace.map((vf) => {
				return {
					fcwa,
					vf,
					run: true
				};
			})
		)
	);

	const defaultTask: WorkerAction = {
		simParams: initialParameters,
		fcwaKey: 'onecar',
		params: {
			maxDistanceInMeters: 1000,
			maxTicks: 20000
		}
	};

	defaultTask.simParams.Sim.tps = 120;


	const workers = new WorkerPool(100);

	const display = readable(workers.pool, function (set) {
		workers.subscribe(set);
	});

	function mttc(params: ParameterInput) {
		const { FV, LV } = params;
		const roots = quadrealroot(0.5 * (FV.ax - LV.ax), FV.vx - LV.vx, -params.Sim.id);
		if (isNaN(roots[0])) return Number.NEGATIVE_INFINITY;
		const minroot = Math.min(...roots.filter((n) => n >= 0));
		if (!isFinite(minroot)) return Number.NEGATIVE_INFINITY;
		return minroot;
	}

	let totalDispatched = 0,
		totalDone = 0;

	function start(fcwa: ValidAlgorithm, vf: number) {
		// for (const time of [15, 5, 15, 2, 3]) {
		// 	const clone = structuredClone(defaultTask);
		// 	clone.params.maxElapsedTimeInSeconds = time;

		// 	workers.dispatch(clone).then(console.log);
		// }
		for (const dA of dAspace)
			for (const dV of dVspace) {
				const clone = structuredClone(defaultTask);
				clone.simParams.FV.vx = vf;
				clone.simParams.LV.vx = vf - dV;
				clone.simParams.FV.ax = dA;
				clone.simParams.Sim.algo = fcwa;
				clone.simParams.Sim.id = Algorithms[fcwa](adapter(clone.simParams));

				if (dV > vf || clone.simParams.Sim.id < 0 || mttc(clone.simParams) <= 0) {
					// console.warn('Skipping');
					continue;
				}

				totalDispatched += 1;

				workers.dispatch(clone).then((res) => {
					console.log(res);
					totalDone += 1;
				});
			}
		allDispatched = true;
	}
	$inspect(tasks);

	function updateTask(fcwa: string, vf: number, run: boolean) {
		const match = tasks.find((el) => el.fcwa == fcwa && el.vf == vf);
		assert(typeof match !== 'undefined');
		match.run = run;
	}

	let allDispatched = false;
</script>

Results:
<div class="m-4 grid grid-cols-[max-content] items-center gap-2">
	<h1>Worker Pool:</h1>
	<section class="grid w-auto grid-cols-20 gap-2">
		{#each Object.entries($display) as [id, worker] (id)}
			<div class="flex flex-col items-center justify-evenly rounded-sm bg-slate-200 px-2 py-1">
				<span class="font-bold">{id}</span>
				<span>{worker.status === 'idle' ? '⌛' : '✅'}</span>
			</div>
		{/each}
	</section>
	<h1>Tasks:</h1>
	<ul class=" ">
		{#each tasks as task (task)}
			{@const { fcwa, vf, run } = task}
			<li class="flex justify-between gap-3">
				<h3>{fcwa} (vf={vf})</h3>
				<span class="*:ml-2">
					<input
						type="checkbox"
						onchange={function () {
							assert(typeof this.checked === 'boolean');
							updateTask(fcwa, vf, this.checked);
						}}
						checked={run}
					/>
					<button onclick={() => start(fcwa, vf)} class="px-3 py-2"> <h3>Start</h3> </button>
				</span>
			</li>
		{/each}
	</ul>
</div>
