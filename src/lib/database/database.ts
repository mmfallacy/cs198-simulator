import Dexie, { type EntityTable } from 'dexie';
import { Fields, type Entry } from './types';

export const db = new Dexie('fcwaSim') as Dexie & {
	runs: EntityTable<Entry, 'params'>;
};

db.version(1).stores({
	runs: `&params, ${Fields}`
});
