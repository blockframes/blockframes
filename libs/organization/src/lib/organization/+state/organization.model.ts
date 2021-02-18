/** Gives information about an application */
import {
  createOrganizationBase,
  PublicOrganization,
  createDenomination,
  OrganizationBase,
} from './organization.firestore';

export {
  OrganizationDocument,
  PLACEHOLDER_LOGO
} from './organization.firestore';
export { OrganizationStatus } from '@blockframes/utils/static-model/types';

export type AppStatus = 'none' | 'requested' | 'accepted';

export interface Organization extends OrganizationBase<Date> {
};

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
    activity: org.activity || null,
    addresses: org.addresses ?? null,
    appAccess: org.appAccess ?? null,
    denomination: createDenomination(org.denomination),
    id: org.id ?? '',
    logo: org.logo ?? '',
  }
}
