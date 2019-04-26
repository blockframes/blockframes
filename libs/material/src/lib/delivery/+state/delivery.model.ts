import { Stakeholder } from "@blockframes/movie";

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
  date: Date;
}

export function createDelivery(params: Partial<Delivery>) {
  return {
    validated: [],
    steps: [],
    delivered: false,
    ...params
  } as Delivery;
}
