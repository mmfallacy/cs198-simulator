import type { AlgorithmInputs, Algorithm } from './algorithms';
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

export function* simulator(params: ParameterInput, fcwa: Algorithm) {
	const FV: Car = {
		x: 0,
		vx: params.FV.vx,
		ax: 0.001,
		abr: params.FV.abr
	};

	const LV: Car = {
		x: params.Sim.dmin,
		vx: params.LV.vx,
		ax: 0,
		abr: params.LV.abr
	};

	const state: State = { FV, LV, tick: 0, dw: 0 };

	state.dw = fcwa(adapter(FV, LV, params.Sim));

	while (true) {
		state.tick += 1;

		state.FV.x += state.FV.vx;
		state.FV.vx += state.FV.ax;

		state.LV.x += state.LV.vx;
		state.LV.vx += state.LV.ax;

		if (state.FV.x > state.LV.x) return;
		yield state;
	}
}
