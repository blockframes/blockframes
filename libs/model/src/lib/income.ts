import { DocumentMeta } from './meta';
import type { Media, MovieCurrency, PaymentStatus, Territory } from './static/types';

export interface Income {
  _meta?: DocumentMeta;
  id: string;
  /** TermId linked to this income */
  termId: string;
  /** The contract that created this income */
  contractId: string;
  price: number;
  version: Record<string, { hidden?: true, price: number }>;
  currency: MovieCurrency;
  offerId?: string;
  titleId?: string;
  status: PaymentStatus;
  date: Date;
  medias: Media[]; // For waterfall purposes, optional
  territories: Territory[]; // For waterfall purposes, optional
  sourceId: string; // Should be defined for waterfall purposes
}

export function createIncome(params: Partial<Income> = {}): Income {
  return {
    id: '',
    termId: '',
    contractId: '',
    price: 0,
    version: {},
    currency: 'EUR',
    status: 'pending',
    date: new Date(),
    medias: [],
    territories: [],
    sourceId: '',
    ...params,
  };
}