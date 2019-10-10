import { Stakeholder, staticModels } from '@blockframes/movie';
import { DeliveryStatus, MGDeadlineRaw, DeliveryDocument, DeliveryDocumentWithDates, StepDocumentWithDate } from './delivery.firestore';

export { DeliveryStatus, CurrencyCode } from './delivery.firestore';
export const Currencies = ( staticModels)['MOVIE_CURRENCIES'];

export type Step = StepDocumentWithDate;

/** Extends a Raw Delivery with fields that are specific to the local data model. */
export interface Delivery extends DeliveryDocumentWithDates {
  stakeholders: Stakeholder[];
}

/** Syntaxic Sugar: the Delivery type in firestore. */
export interface DeliveryWithTimestamps extends DeliveryDocument {
  stakeholders: Stakeholder[];
}

/** Syntaxic Sugar: the Delivery Minumum Guaratee Deadline type used in the frontend. */
export interface MGDeadline extends MGDeadlineRaw<Date> {}

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
