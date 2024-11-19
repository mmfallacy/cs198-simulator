import { bellarusso, hirstgraham, honda, ncar, withdmin } from './algorithms';

export const CAR_M_DIMENSIONS = {
	w: 4.42
};

export const CAR_DIMENSIONS = {
	h: 60,
	w: 120
};
export const RATIO = {
	px_per_m: CAR_DIMENSIONS.w / CAR_M_DIMENSIONS.w,
	kph_per_mps: 3.6
};

export const Algorithms = {
	honda,
	hirstgraham,
	bellarusso,
	wd_honda: withdmin(honda),
	wd_hirstgraham: withdmin(hirstgraham),
	wd_bellarusso: withdmin(bellarusso),
	onecar: ncar(1)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
} as const;

export const MAX_TICK = 10e5;
