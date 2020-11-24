/** Gives information about an application */
import {
  OrganizationDocumentWithDates,
  createOrganizationBase,
  PublicOrganization,
  createDenomination,
} from './organization.firestore';

export {
  OrganizationDocument,
  PLACEHOLDER_LOGO
} from './organization.firestore';
export { OrganizationStatus } from '@blockframes/utils/static-model/types';

export type AppStatus = 'none' | 'requested' | 'accepted';

export type Organization = OrganizationDocumentWithDates;

export interface OrganizationForm {
  name: string;
}

/** A factory function that creates an Organization. */
export function createOrganization(
  params: Partial<Organization> = {}
): Organization {
  return createOrganizationBase(params) as Organization;
}
/** Convert an organization object into a public organization */
export function createPublicOrganization(org: Partial<Organization>): PublicOrganization {
  return {
    id: org.id ?? '',
    denomination: createDenomination(org.denomination),
    logo: org.logo ?? '',
  }
}
