import type { AlgorithmInputs, Algorithm } from './algorithms';
import { CAR_DIMENSIONS, RATIO } from './const';
import type { ParameterInput, SimParameterInput } from './stores/parameter/types';

export interface Car {
	x: number;
	vx: number;
	ax: number;
	abr: number;
}

export interface State {
	FV: Car;
	LV: Car;
	tick: number;
	dw: number;
	dw_hit: boolean;
}

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

export function* simulator(params: ParameterInput, fcwa: Algorithm) {
	const FV: Car = {
		x: 0, // in meters
		vx: params.FV.vx / RATIO.kph_per_mps, // in mps (from kph)
		ax: 0.1, // in mps^2
		abr: params.FV.abr // in mps^2
	};

	const LV: Car = {
		x: params.Sim.id + CAR_W_METER, // in meters
		vx: params.LV.vx / RATIO.kph_per_mps, // in mps (from kph)
		ax: 0, // in mps^2
		abr: params.LV.abr // in mps^2
	};

	const state: State = { FV, LV, tick: 0, dw: 0, dw_hit: false };

	const spt = 1 / params.Sim.tps;

	while (true) {
		state.tick += 1;

		state.FV.x += state.FV.vx * spt;

		state.LV.x += state.LV.vx * spt;
		state.LV.vx += state.LV.ax * spt;

		state.dw = fcwa(adapter(FV, LV, params.Sim));

		// If warning distance is hit, decelerate
		if (state.LV.x - state.FV.x - CAR_W_METER <= state.dw) {
			state.FV.vx += Math.min(state.FV.abr * spt, 0);
			state.dw_hit = true;
		}
		// else, continue acceleration
		else {
			state.FV.vx += state.FV.ax * spt;
			state.dw_hit = false;
		}
		if (state.FV.x + CAR_W_METER > state.LV.x) return;
		yield state;
	}
}
