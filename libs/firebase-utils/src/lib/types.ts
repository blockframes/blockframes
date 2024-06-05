import type { Auth as FirebaseAuth, UserRecord as FirebaseUserRecord } from 'firebase-admin/auth';
import type { Storage as FirebaseStorage } from 'firebase-admin/storage';

export type Auth = FirebaseAuth;
export type Firestore = FirebaseFirestore.Firestore;
export type Storage = FirebaseStorage;
export type DocumentReference = FirebaseFirestore.DocumentReference;
export type QueryDocumentSnapshot = FirebaseFirestore.QueryDocumentSnapshot;
export type QuerySnapshot = FirebaseFirestore.QuerySnapshot;
export type Transaction = FirebaseFirestore.Transaction;
export type UserRecord = FirebaseUserRecord;
export type CollectionReference = FirebaseFirestore.CollectionReference;

export interface BlockframesSnapshot<T = FirebaseFirestore.DocumentData> {
  id: string,
  exists: boolean,
  ref: FirebaseFirestore.DocumentReference<T>,
  data(): T | undefined,
}

export interface BlockframesChange<T = FirebaseFirestore.DocumentData> {
  before: BlockframesSnapshot<T>,
  after: BlockframesSnapshot<T>,
}