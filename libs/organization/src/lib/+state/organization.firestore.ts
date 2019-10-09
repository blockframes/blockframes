export const enum OrganizationStatus {
  pending = 'pending',
  accepted = 'accepted'
}

/** Document model of an organization */
export interface OrganizationDocument {
  id: string;
  name: string;
  address: string;
  created: number;
  updated: number;
  userIds: string[];
  movieIds: string[];
  templateIds: string[];
  status: OrganizationStatus;
  catalog: null;
  logo: string;
  officeAddress: string;
  phoneNumber: string;
}

export const PLACEHOLDER_LOGO = '/assets/logo/organisation_avatar_250.svg';

/**
 * A factory function that creates an Organization
 */
export function createOrganization(params: Partial<OrganizationDocument> = {}): OrganizationDocument {
  return {
    id: '',
    name: '',
    address: '',
    officeAddress: '',
    phoneNumber: '',
    status: OrganizationStatus.pending,
    userIds: [],
    movieIds: [],
    templateIds: [],
    created: Date.now(),
    updated: Date.now(),
    logo: PLACEHOLDER_LOGO,
    catalog: null,
    ...params
  };
}
