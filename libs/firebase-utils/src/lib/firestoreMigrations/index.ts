import * as v0060 from './0060';
import * as v0061 from './0061';
import * as v0062 from './0062';
import * as v0063 from './0063';

import { Firestore, Storage } from '../types';

export interface IMigration {
  upgrade: (db: Firestore, storage: Storage) => Promise<any>;
}

export interface IMigrationWithVersion extends IMigration {
  version: number;
}

export const MIGRATIONS = {
  60: v0060,
  61: v0061,
  62: v0062,
  63: v0063
};

const removedMigrations = 59; // Number of previous migrations removed
export const LATEST_VERSION = removedMigrations + Object.keys(MIGRATIONS).length;

export const VERSIONS_NUMBERS = Object.keys(MIGRATIONS).map(s => parseInt(s, 10));
