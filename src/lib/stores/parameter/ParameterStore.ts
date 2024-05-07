import { writable } from 'svelte/store';
import type { ParameterInput } from './types';

const initialParameters: ParameterInput = {
	FV: {
		vx: 10,
		abr: -5,
		ax: 1
	},
	LV: {
		vx: 10,
		abr: 0,
		ax: 0
	},
	Sim: {
		tr: 10,
		ts: 10,
		dmin: 1,
		id: 1,
		N: 0,
		tps: 120,
		algo: 'honda'
	}
} as const;

export const ParameterStore = writable(initialParameters);
