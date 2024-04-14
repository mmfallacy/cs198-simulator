export function quadrealroot(a: number, b: number, c: number) {
	const disc = Math.sqrt(b * b - 4 * a * c);
	console.log('disc', disc);
	if (isNaN(disc)) return [NaN];

	return [(-b + disc) / (2 * a), (-b - disc) / (2 * a)];
}
