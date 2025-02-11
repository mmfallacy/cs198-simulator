import { COLORS } from '$lib/colors';
import { Container, Graphics, Text, type ColorSource } from 'pixi.js';
import { CAR_DIMENSIONS, RATIO } from './const';

export function createRoad(h: number, w: number) {
	const road = new Graphics();
	road.beginFill(COLORS.NEUTRAL[900]);
	road.drawRect(0, 0, w, h);
	road.endFill();
	return road;
}

export function createVehicle(fill: ColorSource) {
	const car = new Graphics();
	car.beginFill(fill);
	car.drawRect(0, 0, CAR_DIMENSIONS.w, CAR_DIMENSIONS.h);
	car.endFill();

	return car;
}

export function createMarker(fill: ColorSource) {
	const marker = new Graphics();
	marker.beginFill(fill);
	marker.drawRect(0, 0, 2, CAR_DIMENSIONS.h - 10);
	marker.endFill();

	return marker;
}

export function addToCenter(
	parent: Container,
	child: Graphics,
	x: boolean = false,
	y: boolean = true
) {
	console.log(parent.width, parent.height);
	if (x) child.x = (parent.width - child.width) / 2;
	if (y) child.y = (parent.height - child.height) / 2;

	parent.addChild(child);
}

export function createMarkedRoad(h: number, _w: number) {
	const w = (_w + 50) * RATIO.px_per_m;
	const road = new Graphics();
	road.beginFill(COLORS.NEUTRAL[900]);
	road.drawRect(0, 0, w, h);
	road.endFill();

	const laneTemplate = new Graphics();
	laneTemplate.beginFill(COLORS.NEUTRAL[50]);
	laneTemplate.drawRect(0, -2, CAR_DIMENSIONS.w * 0.8, 7);
	laneTemplate.endFill();

	for (let i = 0; i < w; i += laneTemplate.width * 2) {
		let dash = new Graphics(laneTemplate.geometry);
		road.addChild(dash);
		dash.y = 0;
		dash.x = i;
	}

	const signTemplate = new Graphics();
	signTemplate.beginFill(COLORS.NEUTRAL[400]);
	signTemplate.drawRect(0, 0, 3, 40);
	signTemplate.endFill();

	// Signs on every 100 meter marker
	for (let i = 0; i <= _w; i += 100) {
		let sign = new Graphics(signTemplate.geometry);

		let label = new Text(`${i} m`, {
			fill: COLORS.NEUTRAL[400]
		});
		sign.addChild(label);
		label.x = 5;
		label.y = 0;

		road.addChild(sign);
		sign.y = -sign.height - 10;
		sign.x = i * RATIO.px_per_m;
	}

	return road;
}
