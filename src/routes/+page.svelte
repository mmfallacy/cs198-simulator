<script lang="ts">
	import { simulator } from '$lib/simulator';

	const sim = simulator();

	while (true) {
		const { value, done } = sim.next();

		if (done) break;

		console.log(value);
	}
</script>
