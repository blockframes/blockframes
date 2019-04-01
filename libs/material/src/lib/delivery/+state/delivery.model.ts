// tslint:disable-next-line: interface-over-type-literal
export type Delivery = {
  id: string;
  movieId: string;
  stakeholders: string[];
  validated: string[]; // Stakeholder.id[];
  delivered: boolean;
};


export function createDelivery(params: Partial<Delivery>) {
  return {
    validated: [],
    delivered: false,
    ...params
  } as Delivery;
}
