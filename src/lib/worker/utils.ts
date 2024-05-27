import { WorkerReturnSchema, type WorkerAction } from './types';
import Worker from '$lib/worker/worker?worker';
import * as v from 'valibot';

export function createWorkerAndRun(action: WorkerAction) {
	return new Promise((resolve, reject) => {
		const worker = new Worker();

		worker.postMessage(action);

		worker.addEventListener('message', (evt) => resolve(v.parse(WorkerReturnSchema, evt.data)));
		worker.addEventListener('error', (evt) => reject(evt.message));
	});
}
