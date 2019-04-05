// tslint:disable-next-line: interface-over-type-literal
export type Delivery = {
  id: string;
  movieId: string;
  stakeholders: string[];
  validated: string[]; // Stakeholder.id[];
  delivered: boolean;
};

export enum Authorizations {
  canView = 'Can view delivery',
  canEdit = 'Can add, remove and edit materials',
}

export function createDelivery(params: Partial<Delivery>) {
  return {
    validated: [],
    delivered: false,
    ...params
  } as Delivery;
}
