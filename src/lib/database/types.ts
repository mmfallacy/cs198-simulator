import { ParameterSchema } from '../stores/parameter/types';
import * as v from 'valibot';
import { CarSchema, StateSchema } from '../simulator/types';

// FIX: import works but raises "Cannot find module or its corresponding type decs"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import stringify from '@solana/fast-stable-stringify';

const BaseEntrySchema = v.object({
	params: ParameterSchema,
	state: StateSchema
});

function flatten(input: v.InferInput<typeof BaseEntrySchema>) {
	const { FV, LV, ...rest } = input.state;

	return {
		params: stringify(input.params),
		fv_x: FV.x,
		fv_vx: FV.vx,
		fv_ax: FV.ax,
		fv_ave_vx: FV.ave_vx,
		fv_abr: FV.abr,
		lv_x: LV.x,
		lv_vx: LV.vx,
		lv_ax: LV.ax,
		lv_ave_vx: LV.ave_vx,
		lv_abr: LV.abr,
		...rest
	};
}

export const EntrySchema = v.pipe(BaseEntrySchema, v.transform(flatten));

export type Entry = v.InferOutput<typeof EntrySchema>;
/**
 * FIX: Derive fields from EntrySchema.
 * Issue: EntrySchema.entries return the entries of the basis schema StateSchema.
 * 		  instead of the expected transformed schema.
 */

export const RestKeys = Object.keys(StateSchema.entries).filter(
	(key) => key !== 'FV' && key !== 'LV'
);
export const FVKeys = Object.keys(CarSchema.entries).map((key) => `fv_${key}`);
export const LVKeys = Object.keys(CarSchema.entries).map((key) => `lv_${key}`);

export const Fields = [...FVKeys, ...LVKeys, ...RestKeys].join(', ');
