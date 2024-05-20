import { bellarusso, hirstgraham, honda, withdmin } from './algorithms';

export const CAR_DIMENSIONS = {
	h: 60,
	w: 120
};
export const RATIO = {
	px_per_m: CAR_DIMENSIONS.w / 4.5,
	kph_per_mps: 3.6
};

export const Algorithms = {
	honda,
	hirstgraham,
	bellarusso,
	wd_honda: withdmin(honda),
	wd_hirstgraham: withdmin(hirstgraham),
	wd_bellarusso: withdmin(bellarusso)
} as const;

export const MAX_TICK = 10e5;
