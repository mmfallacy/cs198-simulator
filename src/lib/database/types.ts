import {
	CarParameterSchema,
	ParameterSchema,
	SimParameterSchema
} from '$lib/stores/parameter/types';
import * as v from 'valibot';
import { CarSchema, StateSchema } from '../simulator/types';
import { flattenParams, flattenState } from './utils';

// FIX: import works but raises "Cannot find module or its corresponding type decs"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const BaseEntrySchema = v.object({
	params: ParameterSchema,
	state: StateSchema
});

export type Flat = Record<string, number | string | boolean>;

export const EntrySchema = v.pipe(
	BaseEntrySchema,
	v.transform(function (input) {
		return { ...flattenParams(input.params), ...flattenState(input.state) };
	})
);

export type Entry = v.InferOutput<typeof EntrySchema>;
/**
 * FIX: Derive fields from EntrySchema.
 * Issue: EntrySchema.entries return the entries of the basis schema StateSchema.
 * 		  instead of the expected transformed schema.
 */

export const PrimaryKeys = [
	...Object.keys(CarParameterSchema.entries).map((key) => `params_FV_${key}`),
	...Object.keys(CarParameterSchema.entries).map((key) => `params_LV_${key}`),
	...Object.keys(SimParameterSchema.entries).map((key) => `params_Sim_${key}`)
];

export const RestKeys = Object.keys(StateSchema.entries)
	.filter((key) => key !== 'FV' && key !== 'LV')
	.map((key) => `state_${key}`);
export const FVKeys = Object.keys(CarSchema.entries).map((key) => `state_FV_${key}`);
export const LVKeys = Object.keys(CarSchema.entries).map((key) => `state_LV_${key}`);

export const Fields = [...FVKeys, ...LVKeys, ...RestKeys].join(', ');
