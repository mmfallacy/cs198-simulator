<script lang="ts">
	import { assert } from '$lib/assert';
	import { Algorithms, MAX_TICK, RATIO } from '$lib/const';
	import { simulator } from '$lib/simulator/simulator';
	import { SimParameterSchema } from '$lib/stores/parameter/types';
	import { ParameterStore as params } from '$lib/stores/parameter/ParameterStore';
	import * as v from 'valibot';
	import { onDestroy } from 'svelte';
	import { Application } from 'pixi.js';
	import Params from '$lib/components/Params.svelte';
	import { pixiCanvas } from '$lib/actions/pixiCanvas';
	import {
		addToCenter,
		createMarkedRoad,
		createMarker,
		createRoad,
		createVehicle
	} from '$lib/rendererUtils';
	import { COLORS } from '$lib/colors';
	import type { DeepReadonly } from '$lib/utils';
	import type { State } from '$lib/simulator/types';

	let speed = 1;

	function createSimulator() {
		assert(v.is(SimParameterSchema.entries.algo, $params.Sim.algo));
		return simulator($params, Algorithms[$params.Sim.algo]);
	}

	const app = new Application<HTMLCanvasElement>({
		width: 1366,
		height: 383
	});

	let sim = createSimulator();
	let isRendererRunning = false;
	let state: DeepReadonly<State> | undefined = undefined;

	const road = createMarkedRoad(90, 1000 * RATIO.px_per_m);
	road.y = (app.screen.height - road.height) / 2;
	app.stage.addChild(road);

	const FV = createVehicle(COLORS.RED[500]);
	const LV = createVehicle(COLORS.GREEN[500]);
	const marker = createMarker(COLORS.GREEN[200]);

	addToCenter(road, FV);
	addToCenter(road, LV);
	addToCenter(road, marker);

	function initializeRenderer() {
		function render() {
			if (!isRendererRunning) return;

			// Get state information.
			const { value, done } = sim.next();
			if (done) return;

			// Halt simulator on out of bounds
			if (value.tick > MAX_TICK) return;

			// Update screen.

			FV.x = value.FV.x * RATIO.px_per_m;
			LV.x = value.LV.x * RATIO.px_per_m;
			if (LV.x + LV.width + 30 > app.screen.width)
				road.x = app.screen.width - 30 - value.LV.x * RATIO.px_per_m - LV.width;
			marker.x = (value.LV.x - value.dw) * RATIO.px_per_m;

			// Store state for displaying
			state = value;

			// Set longer timeouts when speed < 1;
			requestAnimationFrame(() => setTimeout(render, 10));
		}
		return render;
	}

	function reset() {
		sim = createSimulator();
		isRendererRunning = false;

		LV.x = app.screen.width - LV.width - 30;
		FV.x = LV.x - FV.width - $params.Sim.id;
		marker.x = FV.x;
	}

	function start() {
		isRendererRunning = true;
		requestAnimationFrame(initializeRenderer());
	}

	function stop() {
		isRendererRunning = false;
	}

	$: {
		$params;
		reset();
	}

	onDestroy(function () {
		app.destroy(false, { children: true });
	});
</script>

<main>
	<section>
		<div use:pixiCanvas={app.view}></div>
		<span class="flex">
			{#if isRendererRunning}
				<button on:click={stop}>Stop</button>
			{:else}
				<button on:click={start}>Start</button>
			{/if}

			<button on:click={reset}>Reset</button>
		</span>
		{#if typeof state != 'undefined'}
			<h4>Current Headway: {state.headway}</h4>
			<h4>Average Headway: {state.ave_headway}</h4>
			{#if typeof state.FV != 'undefined'}
				<h4>Following car Average velocity (mps): {state.FV.ave_vx}</h4>
			{/if}
			<h4>Warning Distance ({state.dw_hit ? 'Hit' : 'No Hit'}): {state.dw}</h4>
			<h4>Current MTTC: {state.mttc}</h4>
			<h4>MTTC on first warning distance hit: {state.first_mttc ?? 'not yet hit'}</h4>
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
