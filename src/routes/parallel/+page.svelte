<script lang="ts">
	import { initialParameters } from '$lib/stores/parameter/ParameterStore';
	import { createWorkerAndRun } from '$lib/worker/utils';

	function start() {
		console.log('creating three parallel runners for 5 seconds');

		createWorkerAndRun({
			simParams: initialParameters,
			fcwaKey: 'honda',
			params: {
				maxElapsedTimeInSeconds: 5
			}
		})
			.then(console.log)
			.catch(console.error);

		createWorkerAndRun({
			simParams: initialParameters,
			fcwaKey: 'honda',
			params: {
				maxElapsedTimeInSeconds: 5
			}
		})
			.then(console.log)
			.catch(console.error);

		createWorkerAndRun({
			simParams: initialParameters,
			fcwaKey: 'honda',
			params: {
				maxElapsedTimeInSeconds: 5
			}
		})
			.then(console.log)
			.catch(console.error);
	}
</script>

<button on:click={start}> Start </button>
