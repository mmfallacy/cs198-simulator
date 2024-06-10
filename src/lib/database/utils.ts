import type { State } from '$lib/simulator/types';
import type { ParameterInput } from '$lib/stores/parameter/types';
import type { Flat } from './types';

export function flattenParams(params: ParameterInput) {
	const flat: Flat = {};
	for (const [key, value] of Object.entries(params.FV)) flat[`params_FV_${key}`] = value;
	for (const [key, value] of Object.entries(params.LV)) flat[`params_LV_${key}`] = value;
	for (const [key, value] of Object.entries(params.Sim)) flat[`params_Sim_${key}`] = value;
	return flat;
}

export function flattenState(state: State) {
	const { FV, LV, ...rest } = state;

	const flat: Flat = {};

	for (const [key, value] of Object.entries(FV)) flat[`state_FV_${key}`] = value;
	for (const [key, value] of Object.entries(LV)) flat[`state_LV_${key}`] = value;
	for (const [key, value] of Object.entries(rest)) flat[`state_${key}`] = value;

	return flat;
}
