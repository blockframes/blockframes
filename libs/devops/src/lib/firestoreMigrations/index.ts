import * as v0070 from './0070';
import * as v0071 from './0071';
import * as v0072 from './0072';
import * as v0073 from './0073';
import * as v0074 from './0074';
import * as v0075 from './0075';
import * as v0076 from './0076';
import * as v0077 from './0077';
import * as v0078 from './0078';

const removedMigrations = 69; // Number of previous migrations removed

import { Firestore, Storage } from '@blockframes/firebase-utils';

export interface IMigration {
  upgrade: (db: Firestore, storage: Storage) => Promise<any>;
}

export interface IMigrationWithVersion extends IMigration {
  version: number;
}

export const MIGRATIONS = {
  70: v0070,
  71: v0071,
  72: v0072,
  73: v0073,
  74: v0074,
  75: v0075,
  76: v0076,
  77: v0077,
  78: v0078,
};

export const LATEST_VERSION = removedMigrations + Object.keys(MIGRATIONS).length;

export const VERSIONS_NUMBERS = Object.keys(MIGRATIONS).map(s => parseInt(s, 10));