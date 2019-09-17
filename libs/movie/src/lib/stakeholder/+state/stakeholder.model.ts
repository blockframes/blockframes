import { Organization } from "@blockframes/organization";

export interface Stakeholder {
  id: string;
  organization?: Organization;
  orgMovieRole: string;
  role: string
  isAccepted: boolean;
}

export function createMovieStakeholder(params?: Partial<Stakeholder>) {
  if (params.organization) delete params.organization
  return {
    orgMovieRole: '',
    role: '',
    isAccepted: false,
    ...params,
  } as Stakeholder;
}

export function createDeliveryStakeholder(params?: Partial<Stakeholder>) {
  return {
    ...params,
  } as Stakeholder;
}
