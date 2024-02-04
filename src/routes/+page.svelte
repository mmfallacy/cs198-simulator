<script lang="ts">
	import { pixiCanvas } from '$lib/actions/pixiCanvas';
	import { sda } from '$lib/algorithms';
	import { COLORS } from '$lib/colors';
	import Params from '$lib/components/Params.svelte';
	import { CAR_DIMENSIONS, simulator } from '$lib/simulator';
	import { ParameterStore as params } from '$lib/stores/parameter/ParameterStore';
	import { Application, Container, Graphics, type ColorSource } from 'pixi.js';
	import { onDestroy } from 'svelte';

	const sim = simulator($params, sda);

	const MAX_TICK = 10e3;

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

	function render() {
		const { value, done } = sim.next();
		if (done || value.tick > MAX_TICK) return;

		FV.x = value.FV.x;
		LV.x = value.LV.x;

		requestAnimationFrame(() => setTimeout(render, 10));
	}

	requestAnimationFrame(() => setTimeout(render, 10));

	onDestroy(function () {
		app.destroy(false, { children: true });
	});
</script>

<main>
	<section use:pixiCanvas={app.view} />
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
