import { App } from "./apps";

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