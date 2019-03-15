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
  userIds: string[];
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
    created: params.created || Date.now(),
    updated: params.updated || Date.now()
  } : {} as Organization;
}

export const ROLES = {
  ADMIN: 'ADMIN',
  READ: 'READ',
  WRITE: 'WRITE'
};
