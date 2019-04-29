import { Stakeholder } from "@blockframes/movie";
import { Timestamp } from "rxjs";

export interface Delivery {
  id: string;
  movieId: string;
  validated: string[]; // Stakeholder.id[];
  delivered: boolean;
  stakeholders?: Stakeholder[];
  steps: Step[];
};

export interface Step {
  id: string;
  name: string;
  date: Date | any;
}

export function createDelivery(params: Partial<Delivery>) {
  return {
    validated: [],
    steps: [],
    delivered: false,
    ...params
  } as Delivery;
}
