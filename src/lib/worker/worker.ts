import * as v from 'valibot';
import { WorkerActionSchema, type RunnerParams, type WorkerReturn } from './types';
import type { ParameterInput } from '$lib/stores/parameter/types';
import type { Algorithm } from '$lib/algorithms';
import { MAX_TICK, Algorithms, CAR_DIMENSIONS, RATIO } from '$lib/const';
import { simulator } from '$lib/simulator/simulator';

// Use this postMessage wrapper for worker returns type safety
function postMessage(message: WorkerReturn) {
	self.postMessage(message);
}

onmessage = function (evt) {
	const result = v.safeParse(WorkerActionSchema, evt.data);

	if (!result.success) throw new Error('Invalid Worker Action');
	const { simParams, fcwaKey, params } = result.output;

	const state = runner(simParams, Algorithms[fcwaKey], params);

	postMessage(state);

	self.close();
};

function isUndefined(value: unknown): value is undefined {
	return typeof value === 'undefined';
}

function runner(
	simParams: ParameterInput,
	fcwa: Algorithm,
	params: RunnerParams = { maxTicks: MAX_TICK }
) {
	const sim = simulator(simParams, fcwa);

	const startTime = performance.now();

	const { maxDistanceInMeters, maxDistanceInPx, maxElapsedTimeInSeconds, maxSeconds, maxTicks } =
		params;

	// eslint-disable-next-line no-constant-condition
	while (true) {
		const { value, done } = sim.next();

		if (done) throw new Error('Detected Collision.');

		const distance = value.LV.x + CAR_DIMENSIONS.w / RATIO.px_per_m;

		if (!isUndefined(maxDistanceInMeters) && distance >= maxDistanceInMeters) return value;

		if (!isUndefined(maxDistanceInPx) && distance * RATIO.px_per_m >= maxDistanceInPx) return value;

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
