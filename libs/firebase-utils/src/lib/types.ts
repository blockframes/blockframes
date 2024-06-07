import type { app } from 'firebase-admin';
import * as admin from 'firebase-admin';

import type {
  AppOptions as FirebaseAppOptions,
  Credential as FirebaseCredential,
  ServiceAccount as FirebaseServiceAccount
} from 'firebase-admin/app';

import type {
  Auth as FirebaseAuth,
  ListUsersResult as FirebaseListUsersResult,
  UserImportRecord as FirebaseUserImportRecord,
  UserRecord as FirebaseUserRecord,
  UpdateRequest as FirebaseUpdateRequest
} from 'firebase-admin/auth';

import type {
  Storage as FirebaseStorage
} from 'firebase-admin/storage';

export type Auth = FirebaseAuth;
export type ListUsersResult = FirebaseListUsersResult;
export type UserImportRecord = FirebaseUserImportRecord;
export type Firestore = FirebaseFirestore.Firestore;
export type Storage = FirebaseStorage;
export type DocumentReference = FirebaseFirestore.DocumentReference;
export type QueryDocumentSnapshot = FirebaseFirestore.QueryDocumentSnapshot;
export type DocumentSnapshot = FirebaseFirestore.DocumentSnapshot;
export type QuerySnapshot = FirebaseFirestore.QuerySnapshot;
export type Transaction = FirebaseFirestore.Transaction;
export type UserRecord = FirebaseUserRecord;
export type CollectionReference = FirebaseFirestore.CollectionReference;
export type UpdateRequest = FirebaseUpdateRequest;
export type Credential = FirebaseCredential;
export type ServiceAccount = FirebaseServiceAccount;

// Apps: Cannot use 'firebase-admin/app' as it does not provide storage()
export type FirebaseApp = app.App; // 
export type AppOptions = FirebaseAppOptions;
export const initializeApp = (options?: AppOptions, name?: string) => admin.initializeApp(options, name);
export const getApps = () => admin.apps;

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