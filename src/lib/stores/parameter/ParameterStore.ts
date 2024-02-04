import { writable } from 'svelte/store';
import type { ParameterInput } from './types';

const initialParameters: ParameterInput = {
	FV: {
		vx: 1,
		abr: 1
	},
	LV: {
		vx: 1,
		abr: 1
	},
	Sim: {
		tr: 10,
		ts: 10,
		dmin: 10,
		id: 10,
		N: 0,
		tps: 0
	}
} as const;

export const ParameterStore = writable(initialParameters);
