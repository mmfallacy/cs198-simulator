<script lang="ts">
	import { pixiCanvas } from '$lib/actions/pixiCanvas';
	import Params from '$lib/components/Params.svelte';
	import { simulator, type Car, type State } from '$lib/simulator';
	import { Application, Graphics } from 'pixi.js';

	const LV: Car = {
		x: 0,
		vx: 1
	};

	const FV: Car = {
		x: 1,
		vx: 2
	};

	const init: State = {
		cars: [FV, LV],
		tick: 0
	};
	const sim = simulator(init);

	while (true) {
		const { value, done } = sim.next();

		if (done) break;

		console.log(value);
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
