import * as v0054 from './0054';
import * as v0055 from './0055';
import * as v0056 from './0056';
import * as v0057 from './0057';
import * as v0058 from './0058';
import * as v0059 from './0059';
import * as v0060 from './0060';
import * as v0061 from './0061';
import * as v0062 from './0062';
import * as v0063 from './0063';

const removedMigrations = 53; // Number of previous migrations removed

import { Firestore, Storage } from '../types';

export interface IMigration {
  upgrade: (db: Firestore, storage: Storage) => Promise<any>;
}

export interface IMigrationWithVersion extends IMigration {
  version: number;
}

export const MIGRATIONS = {
  54: v0054,
  55: v0055,
  56: v0056,
  57: v0057,
  58: v0058,
  59: v0059,
  60: v0060,
  61: v0061,
  62: v0062,
  63: v0063
};

export const LATEST_VERSION = removedMigrations + Object.keys(MIGRATIONS).length;

export const VERSIONS_NUMBERS = Object.keys(MIGRATIONS).map(s => parseInt(s, 10));
