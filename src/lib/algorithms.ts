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

export const sda: Algorithm = (inputs) => {
	const { vf, af, vl, al, tr } = inputs;
	return vf * tr + (vf * vf) / (2 * af) - (vl * vl) / (2 * al);
};

export const mazda: Algorithm = (inputs) => {
	const { vf, af, vl, al, tr, ts, dmin } = inputs;
	return vf * tr + Math.abs(vf - vl) * ts + (vf * vf) / (2 * af) - (vl * vl) / (2 * al) + dmin;
};
