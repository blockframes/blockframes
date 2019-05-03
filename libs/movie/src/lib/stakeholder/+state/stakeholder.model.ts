import { Organization } from "@blockframes/organization";

export interface Stakeholder {
  id: string;
  orgId: string;
  organization?: Organization;
  orgMovieRole: string;
  role: string
  authorizations: string[];
  isAccepted: boolean;
}

export function createStakeholder(params?: Partial<Stakeholder>) {
  if (params.organization) delete params.organization
  return {
    authorizations: [],
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
