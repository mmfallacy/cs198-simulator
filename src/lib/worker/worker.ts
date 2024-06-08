import * as v from 'valibot';
import { WorkerActionSchema, type RunnerParams } from './types';
import type { ParameterInput } from '$lib/stores/parameter/types';
import type { Algorithm } from '$lib/algorithms';
import { MAX_TICK, Algorithms, CAR_DIMENSIONS, RATIO } from '$lib/const';
import { simulator } from '$lib/simulator/simulator';
import type { State } from '$lib/simulator/types';

// Use this postMessage wrapper for worker returns type safety
function postSuccess(value: State) {
	self.postMessage({ status: 'success', value });
}

function postError(message: string) {
	self.postMessage({ status: 'error', message });
}

onmessage = async function (evt) {
	const result = v.safeParse(WorkerActionSchema, evt.data);

	console.log('received', result.output);
	if (!result.success) return postError('Invalid worker action');

	const { simParams, fcwaKey, params } = result.output;

	const state = runner(simParams, Algorithms[fcwaKey], params);

	postSuccess(state);
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

		if (done) return value;

		const distance = value.LV.x + CAR_DIMENSIONS.w / RATIO.px_per_m;

		if (!isUndefined(maxDistanceInMeters) && distance >= maxDistanceInMeters) return value;

		if (!isUndefined(maxDistanceInPx) && distance * RATIO.px_per_m >= maxDistanceInPx) return value;

		if (!isUndefined(maxSeconds) && value.tick / simParams.Sim.tps >= maxSeconds) return value;

		if (!isUndefined(maxTicks) && value.tick >= maxTicks) return value;

		if (
			!isUndefined(maxElapsedTimeInSeconds) &&
			performance.now() - startTime >= maxElapsedTimeInSeconds * 1000
		) {
			return value;
		}
	}
}
