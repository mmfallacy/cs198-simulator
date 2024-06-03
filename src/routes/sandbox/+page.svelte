<script lang="ts">
	import { zeroes, add, scalarMul, type Vec } from '$lib/simulator/vector';

	// z = [xf, vf, xl, vl]
	// z' = [vf, af, vl, al]
	const spt = 1 / 120;

	// distance of a from b
	function distance(a: number, b: number) {
		return b - a;
	}

	function af(z: Vec, wd: number) {
		if (distance(z[0], z[2]) < wd) return -5;
		else return 10;
	}

	function fnext(deltaH: number, z: Vec, wd: number): Vec {
		return [z[1] * deltaH, af(z, wd) * deltaH, z[2] * deltaH, 0];
	}

	function rk4_next(z: Vec) {
		const wd = 2.2 * (z[1] - z[3]) + 6.2;
		const k1 = fnext(0, z, wd);
		const u1 = add(z, scalarMul(k1, spt / 2));
		const k2 = fnext(spt / 2, u1, wd);
		const u2 = add(z, scalarMul(k2, spt / 2));
		const k3 = fnext(spt / 2, u2, wd);
		const u3 = add(z, scalarMul(k3, spt));
		const k4 = fnext(spt / 2, u3, wd);

		const k = add(k1, scalarMul(k2, 2), scalarMul(k3, 2), k4);
		return add(z, scalarMul(k, spt / 6));
	}

	const v0: Vec = [0, 10, 1, 10];

	function* stepper(z: Vec, fnext: (z: Vec) => Vec) {
		let next = fnext(z);
		yield next;

		next = fnext(next);
		yield next;

		next = fnext(next);
		yield next;

		next = fnext(next);
		yield next;
	}

	function euler_next(zi: Vec) {
		const z = structuredClone(zi);
		const wd = 2.2 * (z[1] - z[3]) + 6.2;
		z[0] += z[1] * spt;
		z[1] += af(z, wd) * spt;
		z[2] += z[3] * spt;

		return z;
	}

	for (const i of stepper(v0, rk4_next)) {
		console.table(i);
	}
	for (const i of stepper(v0, euler_next)) {
		console.table(i);
	}
</script>
