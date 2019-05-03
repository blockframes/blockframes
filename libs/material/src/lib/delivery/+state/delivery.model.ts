import { Stakeholder } from "@blockframes/movie";
import { firestore } from "firebase/app";
type Timestamp = firestore.Timestamp

interface AbstractDelivery {
  id: string;
  movieId: string;
  validated: string[]; // Stakeholder.id[];
  delivered: boolean;
  stakeholders: Stakeholder[];
  steps: Step[] | StepDB[];
  dueDate?: Date | Timestamp;
}

export interface Delivery extends AbstractDelivery {
  dueDate?: Date;
  steps: Step[];
};

export interface DeliveryDB extends AbstractDelivery {
  dueDate?: Timestamp;
  steps: StepDB[];
};

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

export function createDelivery(params: Partial<Delivery>) {
  return {
    validated: [],
    steps: [],
    delivered: false,
    ...params
  } as Delivery;
}
