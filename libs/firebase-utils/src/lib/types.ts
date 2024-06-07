import type * as admin from 'firebase-admin';

export type Auth = admin.auth.Auth;
export type ListUsersResult = admin.auth.ListUsersResult;
export type UserImportRecord = admin.auth.UserImportRecord;
export type Firestore = admin.firestore.Firestore;
export type Storage = admin.storage.Storage;
export type DocumentReference = admin.firestore.DocumentReference;
export type QueryDocumentSnapshot = admin.firestore.QueryDocumentSnapshot;
export type DocumentSnapshot = admin.firestore.DocumentSnapshot;
export type QuerySnapshot = admin.firestore.QuerySnapshot;
export type Transaction = admin.firestore.Transaction;
export type UserRecord = admin.auth.UserRecord;
export type CollectionReference = admin.firestore.CollectionReference;
export type UpdateRequest = admin.auth.UpdateRequest;
export type Credential = admin.credential.Credential;
export type ServiceAccount = admin.ServiceAccount;
export type FirebaseApp = admin.app.App;

export interface BlockframesSnapshot<T = admin.firestore.DocumentData> {
  id: string,
  exists: boolean,
  ref: admin.firestore.DocumentReference<T>,
  data(): T | undefined,
}

export interface BlockframesChange<T = admin.firestore.DocumentData> {
  before: BlockframesSnapshot<T>,
  after: BlockframesSnapshot<T>,
}