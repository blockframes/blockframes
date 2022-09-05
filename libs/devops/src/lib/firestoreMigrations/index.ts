import * as v0070 from './0070';
import * as v0071 from './0071';
import * as v0072 from './0072';
import * as v0073 from './0073';
import * as v0074 from './0074';
import * as v0075 from './0075';
import * as v0076 from './0076';
import * as v0077 from './0077';
import * as v0078 from './0078';
import * as v0079 from './0079';
import * as v0080 from './0080';
import * as v0081 from './0081';
import * as v0082 from './0082';
import * as v0083 from './0083';
import * as v0084 from './0084';

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
  79: v0079,
  80: v0080,
  81: v0081,
  82: v0082,
  83: v0083,
  84: v0084
};

export const LATEST_VERSION = removedMigrations + Object.keys(MIGRATIONS).length;

export const VERSIONS_NUMBERS = Object.keys(MIGRATIONS).map(s => parseInt(s, 10));
