import * as v0001 from './0001';
import { Firestore } from '../admin';

export interface IMigration {
  upgrade: (db: Firestore) => Promise<any>;
}

export interface IMigrationWithVersion extends IMigration {
  version: number;
}


export const MIGRATIONS = {
  1: v0001
};

export const VERSIONS_NUMBERS = Object.keys(MIGRATIONS).map(s => parseInt(s, 10));
