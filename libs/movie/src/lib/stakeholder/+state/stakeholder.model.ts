import { Organization } from "@blockframes/organization";

export interface Stakeholder {
  id: string;
  orgId: string;
  organization?: Organization;
  orgMovieRole: string;
  role: string
  authorizations: string[];
}

export function createStakeholder(params?: Partial<Stakeholder>) {
  if (params.organization) delete params.organization
  return {
    authorizations: [],
    orgMovieRole: '',
    role: '',
    ...params,
  } as Stakeholder;
}

export function createDeliveryStakeholder(params?: Partial<Stakeholder>) {
  return {
    ...params,
  } as Stakeholder;
}
