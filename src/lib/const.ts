export const COLORS = {
	GRAY: 0x8d8d8d,
	RED: 0xff0000,
	BLUE: 0x0000ff
} as const;

export const CANVAS_DIMENSIONS = [1280, 960] as const;

export type RUN_STATE = 'initial' | 'running' | 'stopped' | 'end';
