import { App } from "./apps";
import type firebase from 'firebase';
type Timestamp = firebase.firestore.Timestamp;

export interface DocumentMeta<D> {
  createdBy: string,
  updatedBy?: string,
  deletedBy?: string,
  createdAt: D,
  updatedAt?: D,
  deletedAt?: D,
  createdFrom?: App,
}

export function createDocumentMeta(meta: Partial<DocumentMeta<Date>> = {}): DocumentMeta<Date> {
  return {
    createdBy: '',
    createdAt: new Date(),
    ...meta
  }
}

export function formatDocumentMetaFromFirestore(
  meta: DocumentMeta<Timestamp>
): DocumentMeta<Date> {

  const m = { ...meta } as DocumentMeta<unknown>;

  if (meta) {
    if (meta.createdAt) {
      m.createdAt = meta.createdAt.toDate();
    }

    if (meta.updatedAt) {
      m.updatedAt = meta.updatedAt.toDate();
    }

    if (meta.deletedAt) {
      m.deletedAt = meta.deletedAt.toDate();
    }
  }

  return m as DocumentMeta<Date>;
}
