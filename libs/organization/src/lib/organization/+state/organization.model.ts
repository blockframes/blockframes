/** Gives information about an application */
import { createStorageFile } from '@blockframes/media/+state/media.firestore';
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

export type Organization = OrganizationBase<Date>;

export const organizationRoles = {
  catalog: { dashboard: 'Seller', marketplace: 'Buyer'},
  festival: { dashboard: 'Sales Agent', marketplace: 'Buyer'},
  financiers: { dashboard: 'Partners', marketplace: 'Investor'}
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
    id: org.id ?? '',
    denomination: createDenomination(org.denomination),
    logo: createStorageFile(org.logo),
  }
}
