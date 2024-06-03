import { StateSchema } from '$lib/simulator/types';
import { Algorithms } from '$lib/const';
import { ParameterSchema } from '$lib/stores/parameter/types';
import * as v from 'valibot';
import type { DeepReadonly } from '$lib/utils';

export const RunnerParamsSchema = v.object({
	maxDistanceInMeters: v.optional(v.number()),
	maxDistanceInPx: v.optional(v.number()),
	maxElapsedTimeInSeconds: v.optional(v.number()),
	maxSeconds: v.optional(v.number()),
	maxTicks: v.optional(v.number())
});

export type RunnerParams = v.Input<typeof RunnerParamsSchema>;

export const WorkerActionSchema = v.object({
	simParams: ParameterSchema,
	fcwaKey: v.picklist(Object.keys(Algorithms) as Array<keyof typeof Algorithms>),
	params: RunnerParamsSchema
});

export type WorkerAction = v.Input<typeof WorkerActionSchema>;

export const WorkerReturnSchema = v.variant('status', [
	v.object({
		status: v.literal('success'),
		value: StateSchema
	}),
	v.object({
		status: v.literal('error'),
		message: v.string()
	})
]);

export type WorkerReturn = DeepReadonly<v.Input<typeof WorkerReturnSchema>>;
