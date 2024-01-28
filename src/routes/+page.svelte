<script lang="ts">
	import { simulator, type State } from '$lib/simulator';

	const init: State = {
		cars: [
			{
				x: 0,
				vx: 1
			},
			{
				x: 1,
				vx: 2
			}
		],
		step: 0
	};
	const sim = simulator(init);

	while (true) {
		const { value, done } = sim.next();

		if (done) break;

		console.log(value);
	}
</script>
