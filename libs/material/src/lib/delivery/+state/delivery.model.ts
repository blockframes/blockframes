import { Stakeholder } from '@blockframes/movie';
import { firestore } from 'firebase/app';

type Timestamp = firestore.Timestamp;

export const enum Currency {
  EUROS = 'EUR',
  DOLLAR = 'DOL',
  YEN = 'YEN'
}

interface InternationalPrice {
  currency: Currency;
  value: number;
}

/**
 * This is a Minimum Guarantee deadline,
 * can be used to interact with the frontend (D = Date) or backend (D = Timestamp).
 */
interface MGDeadlineRaw<D> {
  percent: number;
  date?: D;
  label: string;
}

/**
 * This contains all the info regarding the Minimum Guarantee,
 * can be used to interact with the frontend (D = Date) or backend (D = Timestamp).
 */
interface MGInfoRaw {
  currentDeadline: number;
  price: InternationalPrice;
}

/**
 * The Step of a given delivery,
 * can be used to interact with the frontend (D = Date) or backend (D = Timestamp).
 */
interface StepRaw<D> {
  id: string;
  name: string;
  date: D;
}

/**
 * A given delivery,
 * can be used to interact with the frontend (D = Date) or backend (D = Timestamp).
 */
interface DeliveryRaw<D> {
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
  mgInfo?: MGInfoRaw;
  mgDeadlines: MGDeadlineRaw<D>[];
  steps: StepRaw<D>[];
}

/**
 * Extends a Raw Delivery with fields that are specific to the local data model.
 */
export interface Delivery extends DeliveryRaw<Date> {}

/**
 * Syntaxic Sugar: the Delivery type in firestore.
 */
export interface DeliveryDB extends DeliveryRaw<Timestamp> {}

/**
 * Syntaxic Sugar: the Delivery Step type used in the frontend.
 */
export interface Step extends StepRaw<Date> {}

/**
 * Syntaxic Sugar: the Delivery Minumum Guaratee Deadline type used in the frontend.
 */
export interface MGDeadline extends MGDeadlineRaw<Date> {}

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
