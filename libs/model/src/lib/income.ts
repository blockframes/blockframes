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
  currency: MovieCurrency;
  offerId?: string;
  titleId?: string;
  status: PaymentStatus;
  date: Date;
  /** For waterfall purposes, either medias/territories or sourceId should be defined */
  medias: Media[];
  territories: Territory[];
  sourceId: string;
}

export interface Compensation extends Income {
  isCompensation: true;
  from: string; // Id of the right that is compensating
  to: string; // Id of the right that is compensated
}

export function createIncome(params: Partial<Income> = {}): Income {
  return {
    id: '',
    termId: '',
    contractId: '',
    price: 0,
    currency: 'EUR',
    status: 'pending',
    date: new Date(),
    medias: [],
    territories: [],
    sourceId: '',
    ...params,
  };
}

export function createCompensation(params: Partial<Compensation> = {}): Compensation {
  return {
    ...createIncome(params),
    isCompensation: true,
    from: '',
    to: '',
    ...params,
  };
}

export function isCompensation(params: Partial<Income | Compensation>): params is Compensation {
  return (params as Compensation).isCompensation;
}
