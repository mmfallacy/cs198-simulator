import Dexie, { type EntityTable } from 'dexie';
import { Fields, PrimaryKeys, type Entry } from './types';

export const db = new Dexie('fcwaSim') as Dexie & {
	runs: EntityTable<Entry>;
};

db.version(1).stores({
	runs: `[${PrimaryKeys.join('+')}], ${Fields}`
});
