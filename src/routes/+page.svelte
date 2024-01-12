<script lang="ts">
	import { Application, Graphics, Ticker } from 'pixi.js';
	import { onMount } from 'svelte';

	import { CANVAS_DIMENSIONS, COLORS } from '$lib/const';
	import { CAR_DIMENSIONS, createCar, updateCar } from '$lib/Car';
	import { addToCenter, center } from '$lib/utils';

	let canvas: HTMLCanvasElement;
	let elapsed = 0.0;

	const follow = createCar({
		color: COLORS.BLUE,
		x: 0,
		vx: 1,
		ax: 0.02
	});

	const lead = createCar({
		color: COLORS.RED,
		x: follow.width + 10,
		vx: 2,
		ax: 0
	});

	let app: Application;

	onMount(() => {
		app = new Application({
			view: canvas,
			resolution: window.devicePixelRatio,
			width: CANVAS_DIMENSIONS[0],
			height: CANVAS_DIMENSIONS[1]
		});

		// Create Road
		const road = new Graphics();
		road.beginFill(COLORS.GRAY);
		road.drawRect(0, 0, app.screen.width, CAR_DIMENSIONS[1] * 1.25);
		road.y = center(app.screen.height, road.height);
		app.stage.addChild(road);

		addToCenter(road, lead);
		addToCenter(road, follow);

		return () => {
			road.clear();
			lead.clear();
			follow.clear();
		};
	});
</script>

<main>
	<canvas bind:this={canvas}></canvas>
	<br />
</main>
