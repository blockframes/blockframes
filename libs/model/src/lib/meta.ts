import { App } from './static';

export interface DocumentMeta {
  createdBy: string,
  updatedBy?: string,
  deletedBy?: string,
  createdAt: Date,
  updatedAt?: Date,
  deletedAt?: Date,
  createdFrom?: App,
  emailVerified?: boolean
}

export function createDocumentMeta(meta: Partial<DocumentMeta> = {}): DocumentMeta {
  return {
    createdBy: '',
    createdAt: new Date(),
    ...meta
  }
}

export function createInternalDocumentMeta(meta: Partial<DocumentMeta> = {}): DocumentMeta {
  return createDocumentMeta({ createdBy: 'internal', ...meta });
}
