export type Vec = Array<number>;

export function zeroes(size: number): Vec {
	return Array(size).fill(0);
}

function _add(a: Vec, b: Vec) {
	if (a.length != b.length) throw new Error('Vectors a and b do not match size');
	return a.map((val, i) => val + b[i]);
}

export function add(...args: Vec[]) {
	return args.reduce((sum, cur) => _add(sum, cur));
}

export function dot(a: Vec, b: Vec) {
	return a.map((val, i) => val * b[i]).reduce((sum, cur) => sum + cur, 0);
}

export function scalarMul(a: Vec, b: number) {
	return a.map((val) => val * b);
}
