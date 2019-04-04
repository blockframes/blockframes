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
  return params ? {
    authorizations: [],
    ...params,
  } : {} as Stakeholder;
}
