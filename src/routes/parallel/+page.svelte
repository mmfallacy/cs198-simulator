<script lang="ts">
	import { type WorkerAction } from '$lib/worker/types';
	import { initialParameters } from '$lib/stores/parameter/ParameterStore';
	import { WorkerPool } from '$lib/worker/pool';
	import { readable } from 'svelte/store';
	import { Algorithms, type AlgorithmKeys } from '$lib/const';
	import { adapter, linspace, quadrealroot, sum } from '$lib/utils';
	import type { ParameterInput } from '$lib/stores/parameter/types';
	import { assert } from '$lib/assert';
	import { db } from '$lib/database/database';
	import { exportDB } from 'dexie-export-import';

	const XLIM = 10,
		YLIM = 30,
		GRAN = 300;

	const dAspace = Array.from(linspace(-XLIM, XLIM, GRAN)),
		dVspace = Array.from(linspace(-YLIM, YLIM, GRAN)),
		vfspace = [5, 11, 27];

	const algorithms: AlgorithmKeys[] = ['honda', 'hirstgraham', 'bellarusso', 'onecar'];

	type Task = {
		fcwa: AlgorithmKeys;
		vf: number;
		run: boolean;
		total: number;
		done: number;
	};

	// Generate an array of tasks. Cartesian product of algorithms and vfspace
	const tasks: Task[] = $state(
		algorithms.flatMap((fcwa) =>
			vfspace.map((vf) => {
				return {
					fcwa,
					vf,
					run: true,
					total: 0,
					done: 0
				};
			})
		)
	);

	const defaultTask: WorkerAction = {
		simParams: initialParameters,
		fcwaKey: 'onecar',
		params: {
			maxDistanceInMeters: 1000,
			maxTicks: 100000
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

	function runTask(task: Task) {
		const { vf, fcwa } = task;

		const actions: WorkerAction[] = [];

		for (const dA of dAspace)
			for (const dV of dVspace) {
				const clone = structuredClone(defaultTask);
				clone.simParams.FV.vx = vf;
				clone.simParams.LV.vx = vf - dV;
				clone.simParams.FV.ax = dA;
				clone.simParams.Sim.algo = fcwa;
				clone.fcwaKey = fcwa;
				clone.simParams.Sim.id = Algorithms[fcwa](adapter(clone.simParams));

				if (dV > vf || clone.simParams.Sim.id < 0 || mttc(clone.simParams) <= 0) {
					// console.warn('Skipping');
					continue;
				}

				actions.push(clone);
			}

		task.total = actions.length;

		return new Promise<void>(function (resolve) {
			for (const action of actions) {
				workers.dispatch(action).then((res) => {
					task.done += 1;
					if (task.total === task.done) resolve();
				});
			}
		});
	}

	async function start(task: Task) {
		isAnyTaskRunning = true;
		console.log('Starting', task);
		console.log('Refreshing database');
		// Clear database
		await db.delete({ disableAutoOpen: false });

		console.log('Running Worker');

		await runTask(task);

		console.log('Exporting');

		// Download
		const blob = await exportDB(db);
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${task.fcwa}-vf=${task.vf}.json`;
		a.click();
		a.remove();
		URL.revokeObjectURL(url);

		isAnyTaskRunning = false;
	}

	function updateTask(fcwa: string, vf: number, run: boolean) {
		const match = tasks.find((el) => el.fcwa == fcwa && el.vf == vf);
		assert(typeof match !== 'undefined');
		match.run = run;
	}

	let elapsedTime: undefined | number = $state(undefined);
	async function runAllTasks() {
		const startTime = performance.now();
		for (const task of tasks) {
			if (task.run) await start(task);
		}
		elapsedTime = performance.now() - startTime;
	}

	let isAnyTaskRunning = $state(false);
	let totalDone = $derived(sum(tasks.map((task) => task.done)));
	let totalTasks = $derived(sum(tasks.map((task) => task.total)));
</script>

Results:
<div class="m-4 grid grid-cols-[max-content] items-center gap-2">
	<h1>Worker Pool:</h1>
	<section class="grid w-auto grid-cols-20 gap-2">
		{#each Object.entries($display) as [id, worker] (id)}
			<div class="flex flex-col items-center justify-evenly rounded-sm bg-slate-200 px-2 py-1">
				<span class="font-bold">{id}</span>
				<span>{worker.status === 'idle' ? '✅' : '⌛'}</span>
			</div>
		{/each}
	</section>
	<h1>Tasks:</h1>
	<ul class="*:my-1">
		{#each tasks as task (task)}
			{@const { fcwa, vf, run } = task}
			<li class="flex items-center justify-between gap-3 rounded-full bg-slate-200 px-5 py-1">
				<h3>{fcwa} (vf={vf})</h3>
				<span class="flex items-center *:ml-2">
					<h3>{task.done}/{task.total}</h3>
					<input
						type="checkbox"
						onchange={function () {
							assert(typeof this.checked === 'boolean');
							updateTask(fcwa, vf, this.checked);
						}}
						checked={run}
					/>
					<button onclick={() => start(task)} class="px-3 py-2" disabled={isAnyTaskRunning}>
						{#if isAnyTaskRunning}
							<h3>...</h3>
						{:else}
							<h3>Start</h3>
						{/if}
					</button>
				</span>
			</li>
		{/each}
	</ul>
	<span class="flex">
		<button class="mr-1 flex-1" onclick={runAllTasks} disabled={isAnyTaskRunning}>
			<h2>Run All</h2></button
		>
		<h2>{totalDone}/{totalTasks}</h2>
		{#if elapsedTime}
			<h2>Elapsed Time: {elapsedTime}</h2>
		{/if}
	</span>
</div>
