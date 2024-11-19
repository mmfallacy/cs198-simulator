import { CAR_M_DIMENSIONS } from './const';

export type Algorithm = (inputs: AlgorithmInputs) => number;

export type AlgorithmInputs = {
	vf: number;
	af: number;
	vl: number;
	al: number;
	tr: number;
	ts: number;
	dmin: number;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const nofcwa: Algorithm = (inputs) => {
	return 0;
};

export const sda: Algorithm = (inputs) => {
	const { vf, af, vl, al, tr } = inputs;
	return vf * tr + (vf * vf) / (2 * af) - (vl * vl) / (2 * al);
};

export const mazda: Algorithm = (inputs) => {
	const { vf, af, vl, al, tr, ts, dmin } = inputs;
	return vf * tr + Math.abs(vf - vl) * ts + (vf * vf) / (2 * af) - (vl * vl) / (2 * al) + dmin;
};

export const honda: Algorithm = (inputs) => {
	const { vf, vl } = inputs;
	return 2.2 * (vf - vl) + 6.2;
};

export const hirstgraham: Algorithm = (inputs) => {
	const { vf, vl } = inputs;
	return 3 * (vf - vl) + 0.4905 * vf;
};

export const bellarusso: Algorithm = (inputs) => {
	const { vf, vl } = inputs;
	return 1.25 * (vf - vl) + 1.55 * vf;
};

// With dmin wrapper. Clamp algorithm values to have a minimum value of dmin
export function withdmin(algo: Algorithm): Algorithm {
	return (inputs) => Math.max(algo(inputs), inputs.dmin);
}

export function ncar(n: number): Algorithm {
	return () => CAR_M_DIMENSIONS.w * n;
}
