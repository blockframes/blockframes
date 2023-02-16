import { App } from './static';

export interface DocumentMeta {
  createdBy: string,
  updatedBy?: string,
  createdAt: Date,
  updatedAt?: Date,
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
