import { COLORS } from '$lib/colors';
import { Container, Graphics, type ColorSource } from 'pixi.js';
import { CAR_DIMENSIONS } from './const';

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
	if (x) child.x = (parent.width - child.width) / 2;
	if (y) child.y = (parent.height - child.height) / 2;

	parent.addChild(child);
}

export function createMarkedRoad(h: number, w: number) {
	const road = new Graphics();
	road.beginFill(COLORS.NEUTRAL[900]);
	road.drawRect(0, 0, w, h);
	road.endFill();

	const laneTemplate = new Graphics();
	laneTemplate.beginFill(COLORS.NEUTRAL[50]);
	laneTemplate.drawRect(0, -2, CAR_DIMENSIONS.w * 0.8, 7);
	laneTemplate.endFill();

	const nDash = w / (laneTemplate.width * 2);
	console.log('ndash', nDash);
	for (let i = 0; i < nDash; i++) {
		let dash = new Graphics(laneTemplate.geometry);
		road.addChild(dash);
		dash.y = 0;
		dash.x = i * 2 * laneTemplate.width;
	}
	return road;
}
