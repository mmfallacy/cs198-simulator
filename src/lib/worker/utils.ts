import { WorkerReturnSchema, type WorkerAction } from './types';
import Worker from '$lib/worker/worker?worker';
import * as v from 'valibot';

function runWorker(worker: Worker, action: WorkerAction) {
	return new Promise((resolve) => {
		worker.postMessage(action);
		worker.addEventListener(
			'message',
			function (evt) {
				resolve(v.parse(WorkerReturnSchema, evt.data));
			},
			{ once: true }
		);
	});
}

export interface PoolEntry {
	id: number;
	worker: Worker;
	status: 'idle' | 'running';
}

export type PoolSubscriber = (value: Array<PoolEntry>) => unknown;

export class WorkerPool {
	#pool: Array<PoolEntry>;
	#subscribers: Array<PoolSubscriber>;

	get pool() {
		return this.#pool;
	}

	constructor(size: number) {
		this.#pool = [];
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		for (const id of Array(size)
			.fill(0)
			.map((_, i) => i))
			this.#pool.push({
				id,
				worker: new Worker(),
				status: 'idle'
			});
		this.#subscribers = [];
	}

	getIdleWorker() {
		for (const entry of this.#pool)
			if (entry.status === 'idle') {
				entry.status = 'running';
				this.notify();
				return entry;
			}
		return false;
	}

	selectWorker(): Promise<PoolEntry> {
		return new Promise((resolve) => {
			const check = () => {
				const result = this.getIdleWorker();
				if (result) resolve(result);
				else setTimeout(check, 50);
			};
			check();
		});
	}

	releaseWorker(entry: PoolEntry) {
		entry.status = 'idle';
		this.notify();
	}

	subscribe(fn: PoolSubscriber) {
		this.#subscribers.push(fn);

		return () => this.unsubscribe(fn);
	}

	unsubscribe(fn: PoolSubscriber) {
		this.#subscribers = this.#subscribers.filter((sub) => sub != fn);
	}

	notify() {
		this.#subscribers.forEach((sub) => sub(this.#pool));
	}

	async dispatch(action: WorkerAction) {
		const entry = await this.selectWorker();
		const result = await runWorker(entry.worker, action);

		this.releaseWorker(entry);

		return result;
	}
}
