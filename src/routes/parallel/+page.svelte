<script lang="ts">
	import type { ParameterInput } from '$lib/stores/parameter/types';
	import { simulator } from '$lib/simulator/simulator';
	import type { Algorithm } from '$lib/algorithms';
	import { Algorithms, CAR_DIMENSIONS, MAX_TICK, RATIO } from '$lib/const';
	import { initialParameters } from '$lib/stores/parameter/ParameterStore';

	type RunnerParams = {
		maxDistanceInMeters?: number;
		maxDistanceInPx?: number;
		maxElapsedTimeInSeconds?: number;
		maxSeconds?: number;
		maxTicks?: number;
	};

	function isUndefined(value: unknown): value is undefined {
		return typeof value === 'undefined';
	}

	async function runner(
		simParams: ParameterInput,
		fcwa: Algorithm,
		params: RunnerParams = { maxTicks: MAX_TICK }
	) {
		const sim = simulator(simParams, fcwa);

		let startTime = performance.now();

		const { maxDistanceInMeters, maxDistanceInPx, maxElapsedTimeInSeconds, maxSeconds, maxTicks } =
			params;

		while (true) {
			const { value, done } = sim.next();

			if (done) throw new Error('Detected Collision.');

			const distance = value.LV.x + CAR_DIMENSIONS.w / RATIO.px_per_m;

			if (!isUndefined(maxDistanceInMeters) && distance >= maxDistanceInMeters) return value;

			if (!isUndefined(maxDistanceInPx) && distance * RATIO.px_per_m >= maxDistanceInPx)
				return value;

			if (!isUndefined(maxSeconds) && value.tick / simParams.Sim.tps >= maxSeconds) return value;

			if (!isUndefined(maxTicks) && value.tick >= maxTicks) return value;

			if (
				!isUndefined(maxElapsedTimeInSeconds) &&
				performance.now() - startTime >= maxElapsedTimeInSeconds * 1000
			) {
				console.log(performance.now() - startTime);
				return value;
			}
		}
	}

	async function start() {
		const results = await Promise.allSettled([
			runner(initialParameters, Algorithms['honda'], { maxDistanceInMeters: 500 }),
			runner(initialParameters, Algorithms['hirstgraham'], { maxDistanceInMeters: 500 }),
			runner(initialParameters, Algorithms['bellarusso'], { maxDistanceInMeters: 500 }),
			new Promise((_, reject) => reject()),
			runner(initialParameters, Algorithms['honda'], { maxDistanceInPx: 720 }),
			runner(initialParameters, Algorithms['hirstgraham'], { maxDistanceInPx: 720 }),
			runner(initialParameters, Algorithms['bellarusso'], { maxDistanceInPx: 720 }),
			new Promise((_, reject) => reject()),
			runner(initialParameters, Algorithms['honda'], { maxTicks: 500 }),
			runner(initialParameters, Algorithms['hirstgraham'], { maxTicks: 500 }),
			runner(initialParameters, Algorithms['bellarusso'], { maxTicks: 500 }),
			new Promise((_, reject) => reject()),
			runner(initialParameters, Algorithms['honda'], { maxSeconds: 5 }),
			runner(initialParameters, Algorithms['hirstgraham'], { maxSeconds: 5 }),
			runner(initialParameters, Algorithms['bellarusso'], { maxSeconds: 5 })
		]);

		console.log(results);
		console.log('awaiting elapsed time');
		const nextresults = await Promise.allSettled([
			runner(initialParameters, Algorithms['honda'], { maxElapsedTimeInSeconds: 5 }),
			runner(initialParameters, Algorithms['hirstgraham'], { maxElapsedTimeInSeconds: 5 }),
			runner(initialParameters, Algorithms['bellarusso'], { maxElapsedTimeInSeconds: 5 })
		]);
		console.log(nextresults);
	}
</script>

<button on:click={start}> Start </button>
