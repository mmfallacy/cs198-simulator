import { Graphics } from 'pixi.js';

export type Car = {
	/**
	 * Treated as hex color value of the form 0xrrrggbb
	 * @type {number}
	 * @memberof Car
	 */
	color: number;
	/**
	 * Car's position in the x-axis. in meters
	 * @type {number}
	 * @memberof Car
	 */
	x: number;
	/**
	 * Car's velocity (x-component). In kph
	 * @type {number}
	 * @memberof Car
	 */
	vx: number;
	/**
	 * Car's acceleration (x-component). In kph^2
	 * @type {number}
	 * @memberof Car
	 */
	ax: number;
};

export type InitialCar = Readonly<Pick<Car, 'color' | 'x' | 'vx' | 'ax'>>;

export const CAR_DIMENSIONS = [75, 50] as const;

type RenderableCar = Graphics & Car & { initial: InitialCar };
export function createCar(initial: InitialCar): RenderableCar {
	const g = new Graphics();
	g.beginFill(initial.color);
	g.drawRect(0, 0, ...CAR_DIMENSIONS);

	return Object.assign(g, { initial: initial, ...initial });
}

export function updateCar(car: Car) {
	car.x += car.vx;
	car.vx += car.ax;
}

export function resetCar(car: RenderableCar) {
	car.x = car.initial.x;
	car.vx = car.initial.vx;
	car.ax = car.initial.ax;
}
