/**
 * Collection & Document manipulation
 *
 * This code deals directly with the low level parts of firebase,
 */
import { getDocument } from '@blockframes/firebase-utils/firebase-utils';
import {
  PermissionsDocument,
  App,
  getOrgAppAccess,
  Organization,
  Movie,
} from '@blockframes/model';

/**
 * Gets all the organizations of a movie document
 * @param movieId
 * @returns the organizations that have movie id in organization.movieIds
 */
export async function getOrganizationsOfMovie(movieId: string) {
  const { orgIds } = await getDocument<Movie>(`movies/${movieId}`);
  const promises = orgIds.map(id => getDocument<Organization>(`orgs/${id}`));
  return Promise.all(promises);
}

/** Retrieve the list of superAdmins and admins of an organization */
export async function getAdminIds(organizationId: string): Promise<string[]> { // @TODO #4046 this may be removed at the end
  const permissions = await getDocument<PermissionsDocument>(`permissions/${organizationId}`);

  if (!permissions) {
    throw new Error(`organization: ${organizationId} does not exists`);
  }

  const adminIds = Object.keys(permissions.roles).filter(userId => {
    return (
      permissions.roles[userId] === 'superAdmin' ||
      permissions.roles[userId] === 'admin'
    );
  });
  return adminIds;
}

/**
 * Return the first app name that an org have access to
 * @param _org
 */
export async function getOrgAppKey(_org: Organization | string): Promise<App> {
  if (typeof _org === 'string') {
    const org = await getDocument<Organization>(`orgs/${_org}`);
    return getOrgAppAccess(org)[0];
  } else {
    return getOrgAppAccess(_org)[0];
  };
}
