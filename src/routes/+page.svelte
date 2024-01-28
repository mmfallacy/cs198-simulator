<script lang="ts">
	import { pixiCanvas } from '$lib/actions/pixiCanvas';
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
		step: 0
	};
	const sim = simulator(init);

	while (true) {
		const { value, done } = sim.next();

		if (done) break;

		console.log(value);
	}

	const app = new Application<HTMLCanvasElement>();

	const test = new Graphics();
	test.beginFill(0xff0000);
	test.drawRect(100, 100, 100, 50);
	test.endFill();

	app.stage.addChild(test);
</script>

<div use:pixiCanvas={app.view} />
