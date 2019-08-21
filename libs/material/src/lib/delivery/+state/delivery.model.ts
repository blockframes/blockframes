import { Stakeholder } from '@blockframes/movie';
import { firestore } from 'firebase/app';

type Timestamp = firestore.Timestamp;

interface MGDeadline<D> {
  percent: number;
  date?: D;
  label: string;
}

export const enum Currency {
  EUROS = 'EUR',
  DOLLAR = 'DOL',
  YEN = 'YEN'
}

interface InternationalPrice {
  currency: Currency;
  value: number;
}

interface MGInfo<D> {
  currentDeadline: number;
  price: InternationalPrice;
  deadlines: MGDeadline<D>[];
}

interface AbstractDelivery<D> {
  id: string;
  movieId: string;
  validated: string[]; // Stakeholder.id[];
  delivered: boolean;
  stakeholders: Stakeholder[];
  // Time to accept a material
  acceptationPeriod?: number;
  // Time to return a refused material
  reWorkingPeriod?: number;
  dueDate?: D;
  state: State;
  isPaid: boolean;
  mustChargeMaterials?: boolean;
  mustBeSigned?: boolean;
  _type: 'deliveries';
  mgInfo: MGInfo<D>;
  steps: Step<D>[];
}

export interface Delivery extends AbstractDelivery<Date> {}

interface Step<D> {
  id: string;
  name: string;
  date: D;
}

export enum State {
  pending = 'pending',
  available = 'available',
  delivered = 'delivered',
  accepted = 'accepted',
  refused = 'refused'
}

export function createDelivery(params: Partial<Delivery>) {
  return {
    validated: [],
    steps: [],
    state: State.pending,
    isPaid: false,
    _type: 'deliveries',
    mustChargeMaterials: params.mustChargeMaterials || false,
    mustBeSigned: params.mustBeSigned || false,
    ...params
  } as Delivery;
}
