import { Organization } from "@blockframes/organization";

export interface Stakeholder {
  id: string;
  organization?: Organization;
  role: string
  isAccepted: boolean;
}

export function createDeliveryStakeholder(params?: Partial<Stakeholder>) {
  return {
    ...params,
  } as Stakeholder;
}
