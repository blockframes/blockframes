import { Stakeholder, staticModels } from '@blockframes/movie';
import { firestore } from 'firebase/app';

type Timestamp = firestore.Timestamp;

export const Currencies = ( staticModels)['MOVIE_CURRENCIES'];
export type CurrencyCode = ((typeof staticModels)['MOVIE_CURRENCIES'])[number]['code'];

/** This is a Minimum Guarantee deadline, can be used to interact with the frontend (D = Date) or backend (D = Timestamp). */
interface MGDeadlineRaw<D> {
  percentage: number;
  date?: D;
  label: string;
}

/** The Step of a given delivery, can be used to interact with the frontend (D = Date) or backend (D = Timestamp). */
interface StepRaw<D> {
  id: string;
  name: string;
  date: D;
}

/** A given delivery, can be used to interact with the frontend (D = Date) or backend (D = Timestamp). */
interface DeliveryRaw<D> {
  id: string;
  movieId: string;
  validated: string[]; // Stakeholder.id[];
  isSigned?: boolean;
  delivered: boolean;
  stakeholders: Stakeholder[];
  dueDate?: D;
  status: DeliveryStatus;
  isPaid: boolean;
  mustChargeMaterials?: boolean;
  mustBeSigned?: boolean;
  _type: 'deliveries';
  steps: StepRaw<D>[];
  /** Time to accept a material */
  acceptationPeriod?: number;
  /** Time to return a refused material */
  reWorkingPeriod?: number;
  /** Minimum Guarantee: */
  mgCurrentDeadline?: number;
  mgAmount?: number;
  mgCurrency?: CurrencyCode;
  mgDeadlines: MGDeadlineRaw<D>[];
}

/** Extends a Raw Delivery with fields that are specific to the local data model. */
export interface Delivery extends DeliveryRaw<Date> {}

/** Syntaxic Sugar: the Delivery type in firestore. */
export interface DeliveryDB extends DeliveryRaw<Timestamp> {}

/** Syntaxic Sugar: the Delivery Step type used in the frontend. */
export interface Step extends StepRaw<Date> {}

/** Syntaxic Sugar: the Delivery Minumum Guaratee Deadline type used in the frontend. */
export interface MGDeadline extends MGDeadlineRaw<Date> {}

export const enum DeliveryStatus {
  negociation = 'Delivery in negotiation',
  pending = 'Materials pending',
  noa = 'Notice of Availability',
  nod = 'Notice of Delivery',
  accepted = 'Materials accepted'
}

export const deliveryStatuses: DeliveryStatus[] = [
  DeliveryStatus.negociation,
  DeliveryStatus.pending,
  DeliveryStatus.noa,
  DeliveryStatus.nod,
  DeliveryStatus.accepted
];

export function createDelivery(params: Partial<Delivery>) {
  return {
    validated: [],
    steps: [],
    status: DeliveryStatus.negociation,
    isPaid: false,
    _type: 'deliveries',
    mustChargeMaterials: params.mustChargeMaterials || false,
    mustBeSigned: params.mustBeSigned || false,
    ...params
  } as Delivery;
}
