<script lang="ts">
	import { pixiCanvas } from '$lib/actions/pixiCanvas';
	import { hirstgraham, honda, withdmin } from '$lib/algorithms';
	import { assert } from '$lib/assert';
	import { COLORS } from '$lib/colors';
	import Params from '$lib/components/Params.svelte';
	import { Algorithms, CAR_DIMENSIONS, RATIO } from '$lib/const';
	import { simulator, type State } from '$lib/simulator';
	import { ParameterStore as params } from '$lib/stores/parameter/ParameterStore';
	import { SimParameterSchema } from '$lib/stores/parameter/types';
	import { Application, Container, Graphics, type ColorSource } from 'pixi.js';
	import { onDestroy } from 'svelte';
	import * as v from 'valibot';

	$: sim = createSimulator();

	// Reset on parameter change
	$: {
		$params;
		reset();
	}

	const MAX_TICK = 10e5;
	let speed = 1;

	function createSimulator() {
		assert(v.is(SimParameterSchema.entries.algo, $params.Sim.algo));
		return simulator($params, Algorithms[$params.Sim.algo]);
	}

	const app = new Application<HTMLCanvasElement>({
		width: 1366,
		height: 383
	});

	function createRoad(h: number, w: number) {
		const road = new Graphics();
		road.beginFill(COLORS.NEUTRAL[900]);
		road.drawRect(0, 0, w, h);
		road.endFill();
		return road;
	}

	function createVehicle(fill: ColorSource) {
		const car = new Graphics();
		car.beginFill(fill);
		car.drawRect(0, 0, CAR_DIMENSIONS.w, CAR_DIMENSIONS.h);
		car.endFill();

		return car;
	}

	function createMarker(fill: ColorSource) {
		const marker = new Graphics();
		marker.beginFill(fill);
		marker.drawRect(0, 0, 2, CAR_DIMENSIONS.h - 10);
		marker.endFill();

		return marker;
	}

	function addToCenter(parent: Container, child: Graphics, x: boolean = false, y: boolean = true) {
		if (x) child.x = (parent.width - child.width) / 2;
		if (y) child.y = (parent.height - child.height) / 2;

		parent.addChild(child);
	}

	const road = createRoad(90, app.screen.width);
	road.y = (app.screen.height - road.height) / 2;
	app.stage.addChild(road);

	const FV = createVehicle(COLORS.RED[500]);
	const LV = createVehicle(COLORS.GREEN[500]);
	const marker = createMarker(COLORS.GREEN[200]);

	addToCenter(road, FV);
	addToCenter(road, LV);
	addToCenter(road, marker);

	function log(val: State) {
		const { FV, LV, tick, dw } = val;

		console.group(`${tick} - (${dw})`);
		console.info('FV');
		console.table({ ...FV, pxx: FV.x * RATIO.px_per_m });
		console.info('LV');
		console.table({ ...LV, pxx: LV.x * RATIO.px_per_m });
		console.groupEnd();
	}

	function initializeRenderer() {
		let quarterSkip = 0;
		function shouldSkip(step: number) {
			quarterSkip += step;
			if (quarterSkip >= 1) {
				quarterSkip -= 1;
				return true;
			}
			return false;
		}

		function render() {
			if (!isRendererRunning) return;

			// Handling speed.
			const speedup = Math.max(speed, 1); // on slider input > 1, only render every nth tick.
			const residual = speedup % 1; // account for 0 < n < 1 speed increments. skip only every time > 1.
			const slowdown = Math.min(speed, 1); // on slider input < 1, lengthen timeout.

			for (let i = 0; i < Math.floor(speedup); i++) sim.next();
			if (shouldSkip(residual)) sim.next();

			// Get state information.
			const { value, done } = sim.next();
			if (done) return;

			// Halt simulator on out of bounds
			if (value.FV.x > app.screen.width) return;
			if (value.tick > MAX_TICK) return;
			if (value.FV.x * RATIO.px_per_m > app.screen.width) return;

			// Update screen.
			log(value);

			FV.x = value.FV.x * RATIO.px_per_m;
			LV.x = value.LV.x * RATIO.px_per_m;
			marker.x = (value.LV.x - value.dw) * RATIO.px_per_m;

			// Update gauges
			gauges = {
				dw: value.dw,
				dw_hit: value.dw_hit,
				headway: value.headway,
				ave_headway: value.ave_headway,
				mttc: value.mttc,
				first_mttc: value.first_mttc,
				FV: value.FV
			};

			// Set longer timeouts when speed < 1;
			requestAnimationFrame(() => setTimeout(render, 1000 / ($params.Sim.tps * slowdown)));
		}
		return render;
	}

	function start() {
		isRendererRunning = true;
		requestAnimationFrame(initializeRenderer());
	}

	function stop() {
		isRendererRunning = false;
	}

	function reset() {
		sim = createSimulator();
		isRendererRunning = false;
		gauges = undefined;
		FV.x = 0;
		LV.x = 0;
		marker.x = 0;
	}

	onDestroy(function () {
		app.destroy(false, { children: true });
	});

	let isRendererRunning = false;
	let gauges: Partial<State> | undefined;
</script>

<main>
	<section>
		<div use:pixiCanvas={app.view} />
		<span class="flex">
			<label for="speed">{speed}x</label>
			<input name="speed" type="range" min="0.25" max="3" step="0.25" bind:value={speed} />

			{#if isRendererRunning}
				<button on:click={stop}>Stop</button>
			{:else}
				<button on:click={start}>Start</button>
			{/if}

			<button on:click={reset}>Reset</button>
		</span>
		{#if typeof gauges != 'undefined'}
			<h4>Current Headway: {gauges.headway}</h4>
			<h4>Average Headway: {gauges.ave_headway}</h4>
			{#if typeof gauges.FV != 'undefined'}
				<h4>Following car Average velocity: {gauges.FV.ave_vx * RATIO.kph_per_mps}</h4>
			{/if}
			<h4>Warning Distance ({gauges.dw_hit ? 'Hit' : 'No Hit'}): {gauges.dw}</h4>
			<h4>Current MTTC: {gauges.mttc}</h4>
			<h4>MTTC on first warning distance hit: {gauges.first_mttc ?? 'not yet hit'}</h4>
		{/if}
	</section>
	<section class="params">
		<Params />
	</section>
</main>

<style>
	main {
		display: grid;
		grid-template-columns: auto max-content;
		gap: 1rem;
	}

	.params {
		min-width: 60ch;
	}
</style>
