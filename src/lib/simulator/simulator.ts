import { type Car, type State } from './types';
import type { AlgorithmInputs, Algorithm } from '../algorithms';
import { CAR_DIMENSIONS, RATIO } from '../const';
import type { ParameterInput, SimParameterInput } from '../stores/parameter/types';
import { quadrealroot } from '../utils';

function adapter(FV: Car, LV: Car, Sim: SimParameterInput): AlgorithmInputs {
	return {
		vf: FV.vx,
		af: FV.abr,
		vl: LV.vx,
		al: LV.abr,
		tr: Sim.tr,
		ts: Sim.ts,
		dmin: Sim.dmin
	};
}

const CAR_W_METER = CAR_DIMENSIONS.w / RATIO.px_per_m;

function distance(FV: Car, LV: Car) {
	return LV.x - (FV.x + CAR_W_METER);
}

function mttc(FV: Car, LV: Car) {
	const roots = quadrealroot(0.5 * (FV.ax - LV.ax), FV.vx - LV.vx, -distance(FV, LV));
	if (isNaN(roots[0])) return Number.NEGATIVE_INFINITY;
	return Math.min(...roots.filter((n) => n > 0));
}

export function* simulator(params: ParameterInput, fcwa: Algorithm) {
	const FV: Car = {
		x: 0, // in meters
		vx: params.FV.vx, // in mps
		ave_vx: params.FV.vx, // average vx in mps
		ax: params.FV.ax, // in mps^2
		abr: params.FV.abr // in mps^2
	};

	const LV: Car = {
		x: params.Sim.id + CAR_W_METER, // in meters
		vx: params.LV.vx, // in mps
		ave_vx: params.LV.vx, // average vx in mps
		ax: params.LV.ax, // in mps^2
		abr: params.LV.abr // in mps^2
	};

	const state: State = {
		FV,
		LV,
		tick: 0,
		dw: 0,
		dw_hit: false,
		headway: Number.NEGATIVE_INFINITY,
		ave_headway: 0,
		mttc: Number.NEGATIVE_INFINITY,
		first_mttc: undefined
	};

	const spt = 1 / params.Sim.tps;

	while (true) {
		state.tick += 1;

		state.FV.x += state.FV.vx * spt;

		state.LV.x += state.LV.vx * spt;
		state.LV.vx += state.LV.ax * spt;

		state.dw = fcwa(adapter(FV, LV, params.Sim));

		state.headway = distance(state.FV, state.LV);

		state.ave_headway += (state.headway - state.ave_headway) / state.tick;

		state.mttc = mttc(FV, LV);

		// If warning distance is hit, decelerate
		if (state.headway <= state.dw) {
			state.FV.vx += Math.min(state.FV.abr * spt, 0);
			state.dw_hit = true;
		}
		// else, continue acceleration
		else {
			state.FV.vx += state.FV.ax * spt;
			state.dw_hit = false;
		}

		// Store mttc on first hit
		if (state.dw_hit && typeof state.first_mttc === 'undefined') state.first_mttc = state.mttc;

		// Compute continuous average velocities for both cars.
		state.FV.ave_vx += (state.FV.vx - state.FV.ave_vx) / state.tick;
		state.LV.ave_vx += (state.LV.vx - state.LV.ave_vx) / state.tick;

		if (state.headway <= 0) return;
		yield state;
	}
}
