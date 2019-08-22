import { Stakeholder } from '@blockframes/movie';
import { firestore } from 'firebase/app';
type Timestamp = firestore.Timestamp;

interface AbstractDelivery {
  id: string;
  movieId: string;
  validated: string[]; // Stakeholder.id[];
  delivered: boolean;
  stakeholders: Stakeholder[];
  steps: Step[] | StepDB[];
  dueDate?: Date | Timestamp;
  // Time to accept a material
  acceptationPeriod?: number;
  // Time to return a refused material
  reWorkingPeriod?: number;
  state: State;
  isPaid: boolean;
  mustChargeMaterials?: boolean;
  mustBeSigned?: boolean;
  _type: 'deliveries';
  amount?: number;
  currency: string;
}

export interface Delivery extends AbstractDelivery {
  dueDate?: Date;
  steps: Step[];
}

export interface DeliveryDB extends AbstractDelivery {
  dueDate?: Timestamp;
  steps: StepDB[];
}

interface AbstractStep {
  id: string;
  name: string;
  date: Date | Timestamp;
}

export interface Step extends AbstractStep {
  date: Date;
}

export interface StepDB extends AbstractStep {
  date: Timestamp;
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
