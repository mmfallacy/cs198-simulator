import * as v from 'valibot';

export const CarSchema = v.object({
	x: v.number(),
	vx: v.number(),
	ave_vx: v.number(),
	ax: v.number(),
	abr: v.number()
});
export type Car = v.Input<typeof CarSchema>;

export const StateSchema = v.object({
	FV: CarSchema,
	LV: CarSchema,
	tick: v.number(),
	dw: v.number(),
	dw_hit: v.boolean(),
	headway: v.number(),
	ave_headway: v.number(),
	mttc: v.number(),
	first_mttc: v.optional(v.number())
});

export type State = v.Input<typeof StateSchema>;
