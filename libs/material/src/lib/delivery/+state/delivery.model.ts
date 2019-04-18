import { Stakeholder } from "@blockframes/movie";

// tslint:disable-next-line: interface-over-type-literal
export type Delivery = {
  id: string;
  movieId: string;
  validated: string[]; // Stakeholder.id[];
  delivered: boolean;
  stakeholders?: Stakeholder[];
};

export function createDelivery(params: Partial<Delivery>) {
  return {
    validated: [],
    delivered: false,
    ...params
  } as Delivery;
}
