import type { ParameterInput } from './stores/parameter/types';

export function quadrealroot(a: number, b: number, c: number) {
	const disc = Math.sqrt(b * b - 4 * a * c);
	if (isNaN(disc)) return [NaN];

	return [(-b + disc) / (2 * a), (-b - disc) / (2 * a)];
}

// Fixes Readonly being shallow which allows mutation of nested objects.
// See also: https://github.com/microsoft/TypeScript/issues/10725#issuecomment-699193070
export type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> };

export function adapter(params: ParameterInput) {
	return {
		vf: params.FV.vx,
		af: params.FV.abr,
		vl: params.LV.vx,
		al: params.LV.abr,
		tr: params.Sim.tr,
		ts: params.Sim.ts,
		dmin: params.Sim.dmin
	};
}

// Derived from numpy's `linspace` function
// https://github.com/numpy/numpy/blob/v1.26.0/numpy/core/function_base.py#L24-L182
export function* linspace(start: number, stop: number, gran: number) {
	const delta = stop - start;
	const div = gran - 1;
	while (start < stop) {
		start += delta / div;
		yield start;
	}
}
