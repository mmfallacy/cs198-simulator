<script lang="ts">
	import { pixiCanvas } from '$lib/actions/pixiCanvas';
	import { sda } from '$lib/algorithms';
	import Params from '$lib/components/Params.svelte';
	import { simulator } from '$lib/simulator';
	import { ParameterStore as params } from '$lib/stores/parameter/ParameterStore';
	import { Application, Graphics } from 'pixi.js';

	const sim = simulator($params, sda);

	const MAX_TICK = 10e3;

	while (true) {
		const { value, done } = sim.next();

		if (done || value.tick > MAX_TICK) break;

		console.log(value.tick, value.dw);
		console.log('FV');
		console.table(value.FV);
		console.log('LV');
		console.table(value.LV);
	}

	const app = new Application<HTMLCanvasElement>({
		width: 1366,
		height: 768
	});

	const test = new Graphics();
	test.beginFill(0xff0000);
	test.drawRect(100, 100, 100, 50);
	test.endFill();

	app.stage.addChild(test);
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
