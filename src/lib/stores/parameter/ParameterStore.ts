import { writable } from 'svelte/store';
import type { ParameterInput } from './types';

const initialParameters: ParameterInput = {
	FV: {
		vx: 0,
		abr: 0
	},
	LV: {
		vx: 0,
		abr: 0
	},
	Sim: {
		tr: 0,
		ts: 0,
		dmin: 0,
		N: 0,
		tps: 0
	}
} as const;

export const ParameterStore = writable(initialParameters);
