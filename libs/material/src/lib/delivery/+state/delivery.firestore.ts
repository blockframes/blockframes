import { default as staticModels } from '@blockframes/utils/static-model/staticModels';
import { firestore } from 'firebase';
import { ScheduleRaw } from "@blockframes/utils/common-interfaces/schedule";

export type Timestamp = firestore.Timestamp;
export type CurrencySlug = ((typeof staticModels)['MOVIE_CURRENCIES'])[number]['slug'];

export const enum DeliveryStatus {
  negociation = 'Delivery in negotiation',
  pending = 'Materials pending',
  noa = 'Notice of Availability',
  nod = 'Notice of Delivery',
  accepted = 'Materials accepted'
}

/** This is a Minimum Guarantee deadline, can be used to interact with the frontend (D = Date) or backend (D = Timestamp). */
export interface MGDeadlineRaw<D> extends ScheduleRaw<D> {
  date?: D;
}

/** The Step of a given delivery, can be used to interact with the frontend (D = Date) or backend (D = Timestamp). */
interface StepRaw<D> {
  id: string;
  name: string;
  date?: D | null;
}

/** A given delivery, can be used to interact with the frontend (D = Date) or backend (D = Timestamp). */
interface DeliveryRaw<D> {
  id: string;
  _type: 'deliveries';
  isPaid: boolean;
  movieId: string;
  mustChargeMaterials?: boolean;
  mustBeSigned?: boolean;
  status: DeliveryStatus;
  dueDate?: D;
  /** Time to accept a material */
  acceptationPeriod?: number;
  /** Time to return a refused material */
  reWorkingPeriod?: number;
  mgAmount?: number;
  mgCurrency?: CurrencySlug;
  mgDeadlines?: MGDeadlineRaw<D>[];
  steps: StepRaw<D>[];
  validated: string[]; // Stakeholder.id[];
  mgCurrentDeadline?: number;
  isSigned?: boolean;
  processedId?: string;
  stakeholderIds: string[];
}

/** Document model of a delivery */
export interface DeliveryDocument extends DeliveryRaw<Timestamp> {
}

export interface DeliveryDocumentWithDates extends DeliveryRaw<Date> {
}

/** Document model of a Step */
export interface StepDocument extends StepRaw<Timestamp> {}

/** Document model of a Step with dates typed in Date. */
export interface StepDocumentWithDate extends StepRaw<Date> {}

/** Convert a StepDocument to a Step (that uses Date). */
export function convertStepDocumentToStepDocumentWithDate(steps: StepDocument[]): StepDocumentWithDate[] {
  if (!steps) {
    return [];
  }

  return steps.map(step => {
    if (!!step.date) {
      return { ...step, date: step.date.toDate() };
    } else {
      return { ...step, date: null}
    }
  });
}
