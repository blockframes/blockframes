import * as v0001 from './0001';
import * as v0002 from './0002';
import * as v0003 from './0003';
import * as v0004 from './0004';
import * as v0005 from './0005';
import * as v0006 from './0006';
import * as v0007 from './0007';
import * as v0008 from './0008';
import * as v0009 from './0009';
import * as v0010 from './0010';
import * as v0011 from './0011';
import * as v0012 from './0012';
import * as v0013 from './0013';
import * as v0014 from './0014';
import * as v0015 from './0015';
import * as v0016 from './0016';
import * as v0017 from './0017';
import * as v0018 from './0018';
import * as v0019 from './0019';
import * as v0020 from './0020';
import * as v0021 from './0021';
import * as v0022 from './0022';
import * as v0023 from './0023';
import * as v0024 from './0024';
import * as v0025 from './0025';
import * as v0026 from './0026';
import * as v0027 from './0027';
import * as v0028 from './0028';
import * as v0029 from './0029';
import * as v0030 from './0030';
import * as v0031 from './0031';
import * as v0032 from './tempo-30';

import { Firestore, Storage } from '../admin';

export interface IMigration {
  upgrade: (db: Firestore, storage: Storage) => Promise<any>;
}

export interface IMigrationWithVersion extends IMigration {
  version: number;
}

export const MIGRATIONS = {
  1: v0001,
  2: v0002,
  3: v0003,
  4: v0004,
  5: v0005,
  6: v0006,
  7: v0007,
  8: v0008,
  9: v0009,
  10: v0010,
  11: v0011,
  12: v0012,
  13: v0013,
  14: v0014,
  15: v0015,
  16: v0016,
  17: v0017,
  18: v0018,
  19: v0019,
  20: v0020,
  21: v0021,
  22: v0022,
  23: v0023,
  24: v0024,
  25: v0025,
  26: v0026,
  27: v0027,
  28: v0028,
  29: v0029,
  30: v0030,
  31: v0031,
  32: v0032,
  // 30: v0030,
};

export const VERSIONS_NUMBERS = Object.keys(MIGRATIONS).map(s => parseInt(s, 10));
