import { Algorithms } from '$lib/const';
import * as v from 'valibot';

export const CarParameterSchema = v.object({
	// Initial velocity (float)
	vx: v.number(),
	// Acceleration due to braking (negative float).
	abr: v.number([v.maxValue(0)]),
	// Acceleration. (positive float)
	ax: v.number([v.minValue(0)])
});

export const SimParameterSchema = v.object({
	// Reaction time delay (ms)
	tr: v.number([v.minValue(0)]),
	// System time delay (ms)
	ts: v.number([v.minValue(0)]),
	// Minimum Safety Distance (float)
	dmin: v.number([v.minValue(0)]),
	// Initial distance between FV and LV
	id: v.number([v.minValue(0)]),
	// Test runs (positive integer),
	N: v.number([v.minValue(0), v.integer()]),
	// Ticks per second,
	tps: v.number([v.minValue(0), v.integer()]),
	// FCWS Algorithm used,
	algo: v.picklist(Object.keys(Algorithms) as Array<keyof typeof Algorithms>)
});

export const ParameterSchema = v.object({
	FV: CarParameterSchema,
	LV: CarParameterSchema,
	Sim: SimParameterSchema
});

export type CarParameterInput = v.Input<typeof CarParameterSchema>;
export type SimParameterInput = v.Input<typeof SimParameterSchema>;
export type ParameterInput = v.Input<typeof ParameterSchema>;
