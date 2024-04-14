<script lang="ts">
	import { pixiCanvas } from '$lib/actions/pixiCanvas';
	import { sda } from '$lib/algorithms';
	import { COLORS } from '$lib/colors';
	import Params from '$lib/components/Params.svelte';
	import { CAR_DIMENSIONS, RATIO } from '$lib/const';
	import { simulator, type State } from '$lib/simulator';
	import { ParameterStore as params } from '$lib/stores/parameter/ParameterStore';
	import { Application, Container, Graphics, type ColorSource } from 'pixi.js';
	import { onDestroy } from 'svelte';

	$: sim = simulator($params, sda);

	const MAX_TICK = 10e5;
	let speed = 1;

	// while (true) {
	// 	const { value, done } = sim.next();

	// 	if (done || value.tick > MAX_TICK) break;

	// 	console.log(value.tick, value.dw);
	// 	console.log('FV');
	// 	console.table(value.FV);
	// 	console.log('LV');
	// 	console.table(value.LV);
	// }

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
	addToCenter(road, FV);
	addToCenter(road, LV);

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

		requestAnimationFrame(() => setTimeout(render, 1000 / ($params.Sim.tps * speed)));
	}

	onDestroy(function () {
		app.destroy(false, { children: true });
	});
</script>

<main>
	<section>
		<div use:pixiCanvas={app.view} />
		<h4>{speed}x</h4>
		<input type="range" min="0.25" max="2" step="0.25" bind:value={speed} />
		<button on:click={() => requestAnimationFrame(render)}>Start</button>
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
