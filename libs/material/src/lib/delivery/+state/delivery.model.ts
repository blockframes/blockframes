// tslint:disable-next-line: interface-over-type-literal
export type Delivery = {
  id: string;
  movieId: string;
  stakeholders: string[];
  validated: string[]; // Stakeholder.id[];
  delivered: boolean;
};


export function createDelivery(delivery: Partial<Delivery>) {
  return {
    id: delivery.id,
    movieId: delivery.movieId,
    stakeholders: delivery.stakeholders,
    validated: delivery.validated || [],
    delivered: delivery.delivered || false,
  } as Delivery;
}
