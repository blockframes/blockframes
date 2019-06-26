import { Movie } from "@blockframes/movie";
import { Template } from "@blockframes/material";

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
  movieIds: string[];
  templates?: Template[];
  members?: OrgMember[];
}

export interface OrganizationWithMovies extends Organization {
  movies: Movie[];
}

export interface OrganizationRights {
  orgId: string;
  superAdmin: string;
  canCreate: string[];
  canRead: string[];
  canUpdate: string[];
  canDelete: string[];
  admins: string[];
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
    created: params.created || Date.now(),
    updated: params.updated || Date.now(),
  } : {} as Organization;
}
