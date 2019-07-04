export interface OrgMember {
  id: string;
  email: string;
  roles: string[];
}

export interface Organization {
  id: string;
  name: string;
  address: string;
  created: number;
  updated: number;
  movieIds: string[];
  templateIds: string[];
  userIds: string[];
  members?: OrgMember[];
}

export interface OrgForm {
  name: string;
  adress: string;
}

/**
 * A factory function that creates an Organization
 */
export function createOrganization(params?: Partial<Organization>): Organization {
  return params ? {
    id: params.id || '',
    name: params.name,
    address: params.address,
    userIds: params.userIds,
    movieIds: params.movieIds || [],
    templateIds: params.templateIds || [],
    created: params.created || Date.now(),
    updated: params.updated || Date.now(),
  } : {} as Organization;
}
