export interface Car {
	x: number;
	vx: number;
}

export interface State {
	cars: Array<Car>;
	step: number;
}

export function* simulator(init: State) {
	const state = structuredClone(init);

	while (true) {
		// Update cars by adding vx
		state.cars.map((car) => (car.x += car.vx));

		// Temporary halting condition
		if (state.cars.some((car) => car.x >= 100)) return;

		state.step++;
		yield state;
	}
}
