<script lang="ts">
	import { pixiCanvas } from '$lib/actions/pixiCanvas';
	import { honda, sda } from '$lib/algorithms';
	import { COLORS } from '$lib/colors';
	import Params from '$lib/components/Params.svelte';
	import { CAR_DIMENSIONS, RATIO } from '$lib/const';
	import { simulator, type State } from '$lib/simulator';
	import { ParameterStore as params } from '$lib/stores/parameter/ParameterStore';
	import { Application, Container, Graphics, type ColorSource } from 'pixi.js';
	import { onDestroy } from 'svelte';

	$: sim = simulator($params, honda);

	const MAX_TICK = 10e5;
	let speed = 1;

	const app = new Application<HTMLCanvasElement>({
		width: 1366,
		height: 768
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

	function render() {
		const { value, done } = sim.next();
		if (done) return;
		// Halt simulator on out of bounds
		if (value.FV.x > app.screen.width) return;
		if (value.tick > MAX_TICK) return;
		if (value.FV.x * RATIO.px_per_m > app.screen.width) return;

		log(value);

		FV.x = value.FV.x * RATIO.px_per_m;
		LV.x = value.LV.x * RATIO.px_per_m;

		gauges = {
			dw: value.dw,
			dw_hit: value.dw_hit,
			headway: value.headway,
			mttc: value.mttc
		};

		marker.x = (value.LV.x - value.dw) * RATIO.px_per_m;

		requestAnimationFrame(() => setTimeout(render, 1000 / ($params.Sim.tps * speed)));
	}

	onDestroy(function () {
		app.destroy(false, { children: true });
	});

	let gauges: Partial<State>;
</script>

<main>
	<section>
		<div use:pixiCanvas={app.view} />
		<h4>{speed}x</h4>
		<input type="range" min="0.25" max="2" step="0.25" bind:value={speed} />
		<button on:click={() => requestAnimationFrame(render)}>Start</button>
		{#if typeof gauges != 'undefined'}
			<h4>Headway: {gauges.headway}</h4>
			<h4>Warning Distance ({gauges.dw_hit ? 'Hit' : 'No Hit'}): {gauges.dw}</h4>
			<h4>MTTC: {gauges.mttc}</h4>
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
