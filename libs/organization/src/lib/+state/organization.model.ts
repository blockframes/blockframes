export interface Organization {
  id: string;
  name: string,
  members: { id: string, role: string }[];
  created: number;
  updated: number;
}

/**
 * A factory function that creates an Organization
 */
export function createOrganization(params?: Partial<Organization>): Organization {
  return params ? {
    id: params.id || '',
    name: params.name,
    members: params.members || [],
    created: params.created || Date.now(),
    updated: params.updated || Date.now()
  } : {} as Organization;
}
