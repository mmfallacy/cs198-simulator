import { WorkerReturnSchema, type WorkerAction } from './types';
import Worker from '$lib/worker/worker?worker';
import * as v from 'valibot';
import { noop } from '$lib/utils';

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
	#logger: Function;

	get pool() {
		return this.#pool;
	}

	constructor(size: number, verbose = false) {
		this.#pool = [];
		this.#logger = verbose ? console.log : noop;
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

	destructor() {
		this.#pool.forEach(function (entry) {
			entry.worker.terminate();
		});

		this.#pool = [];
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
			const timeout = 5;

			const check = () => {
				const result = this.getIdleWorker();
				if (result) resolve(result);
				else setTimeout(check, timeout);
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
		this.#logger(`Worker ${entry.id} running: `, action);
		const result = await runWorker(entry.worker, action);
		this.releaseWorker(entry);
		this.#logger(`Worker ${entry.id} released`, result);

		return result;
	}
}
