import { initialParameters } from './../stores/parameter/ParameterStore';
import type { State } from '$lib/simulator/types';
import { SimParameterSchema, type ParameterInput } from '$lib/stores/parameter/types';
import type { Flat } from './types';
import * as v from 'valibot';

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

function castNumber(value: unknown): number {
	if (typeof value !== 'number') throw new Error('Assertion Error: is not a number');
	return value;
}
function castBoolean(value: unknown): boolean {
	if (typeof value !== 'boolean') throw new Error('Assertion Error: is not a boolean');
	return value;
}

export function unflattenParams(flat: Flat): ParameterInput {
	const result = initialParameters;

	result.FV.abr = castNumber(flat.params_FV_abr);
	result.FV.ax = castNumber(flat.params_FV_ax);
	result.FV.vx = castNumber(flat.params_FV_vx);

	result.LV.abr = castNumber(flat.params_LV_abr);
	result.LV.ax = castNumber(flat.params_LV_ax);
	result.LV.vx = castNumber(flat.params_LV_vx);

	result.Sim.N = castNumber(flat.params_Sim_N);

	result.Sim.algo = v.parse(SimParameterSchema.entries.algo, flat.params_Sim_algo);

	result.Sim.dmin = castNumber(flat.params_Sim_dmin);
	result.Sim.id = castNumber(flat.params_Sim_id);
	result.Sim.tps = castNumber(flat.params_Sim_tps);
	result.Sim.tr = castNumber(flat.params_Sim_tr);
	result.Sim.ts = castNumber(flat.params_Sim_ts);

	return result;
}

export function unflattenState(flat: Flat): State {
	const FV = {
		abr: 0,
		vx: 0,
		ax: 0,
		x: 0,
		ave_vx: 0
	};

	FV.abr = castNumber(flat.state_FV_abr);
	FV.vx = castNumber(flat.state_FV_vx);
	FV.ax = castNumber(flat.state_FV_ax);
	FV.x = castNumber(flat.state_FV_x);
	FV.ave_vx = castNumber(flat.state_FV_ave_vx);

	const LV = {
		abr: 0,
		vx: 0,
		ax: 0,
		x: 0,
		ave_vx: 0
	};

	LV.abr = castNumber(flat.state_LV_abr);
	LV.vx = castNumber(flat.state_LV_vx);
	LV.ax = castNumber(flat.state_LV_ax);
	LV.x = castNumber(flat.state_LV_x);
	LV.ave_vx = castNumber(flat.state_LV_ave_vx);

	const result: State = {
		FV,
		LV,
		tick: 0,
		dw: 0,
		dw_hit: false,
		headway: Number.NEGATIVE_INFINITY,
		ave_headway: 0,
		mttc: Number.NEGATIVE_INFINITY,
		first_mttc: undefined,
		collision: false
	};

	result.tick = castNumber(flat.state_tick);
	result.dw = castNumber(flat.state_dw);
	result.dw_hit = castBoolean(flat.state_dw_hit);
	result.headway = castNumber(flat.state_headway);
	result.ave_headway = castNumber(flat.state_ave_headway);
	result.mttc = castNumber(flat.state_mttc);
	if (typeof flat.state_first_mttc !== 'undefined')
		result.first_mttc = castNumber(flat.state_first_mttc);
	result.collision = castBoolean(flat.state_collision);

	return result;
}
