import { staticModels } from '@blockframes/utils/static-model';
import { DeliveryStatus, MGDeadlineRaw, DeliveryDocument, DeliveryDocumentWithDates, StepDocumentWithDate } from './delivery.firestore';
import { Stakeholder } from '../stakeholder/+state/stakeholder.model';

export { DeliveryStatus, CurrencyCode } from './delivery.firestore';
export const Currencies = ( staticModels)['MOVIE_CURRENCIES'];

export type Step = StepDocumentWithDate;

/** The delivery interface with dates typed in Date and stakeholders used by front-end. */
export interface Delivery extends DeliveryDocumentWithDates {
  stakeholders: Stakeholder[];
}

/** The delivery interface with dates typed in Timestamp and stakeholders used by guards. */
export interface DeliveryWithTimestamps extends DeliveryDocument {
  stakeholders: Stakeholder[];
}

/** The MGDeadline interface typed with Date. */
export interface MGDeadline extends MGDeadlineRaw<Date> {}

export const deliveryStatuses: DeliveryStatus[] = [
  DeliveryStatus.negociation,
  DeliveryStatus.pending,
  DeliveryStatus.noa,
  DeliveryStatus.nod,
  DeliveryStatus.accepted
];

/** A factory function to create a delivery. */
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

export function timestampObjectsToDate(docs: any[] = []) {
  return docs.map(doc => doc.date ? { ...doc, date: doc.date.toDate() } : doc);
}

/** Takes a DeliveryDB (dates in Timestamp) and returns a Delivery with dates in type Date */
export function createDeliveryFromFirestore(delivery: DeliveryWithTimestamps): Delivery {
  const mgDeadlines = delivery.mgDeadlines || [];

  return {
    ...delivery,
    dueDate: delivery.dueDate ? delivery.dueDate.toDate() : null,
    steps: timestampObjectsToDate(delivery.steps),
    mgDeadlines: timestampObjectsToDate(mgDeadlines)
  };
}
