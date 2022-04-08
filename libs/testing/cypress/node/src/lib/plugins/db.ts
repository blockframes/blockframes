import { db } from '../testing-cypress';
import { createUser, createOrganization, Organization, createPermissions, Movie } from '@blockframes/model';
import { App, ModuleAccess } from '@blockframes/utils/apps';
import { isUndefined } from 'lodash';

//* USERS

export async function getRandomEmail() {
  const { email } = await getRandomUser();
  return email;
}

export async function getRandomUser() {
  const { docs } = await db.collection('users').get();
  const randomIndex = Math.floor(Math.random() * docs.length);
  return createUser(docs[randomIndex].data());
}

export function deleteUser(userId: string) {
  return db.doc(`users/${userId}`).delete();
}

//* ORGS

function getMarketplaceOrgs(app: App) {
  return db
    .collection('orgs')
    .where('status', '==', 'accepted')
    .where(`appAccess.${app}.marketplace`, '==', true)
    .where(`appAccess.${app}.dashboard`, '==', false)
    .get();
}

function getDashboardOrgs(app: App) {
  return db.collection('orgs').where('status', '==', 'accepted').where(`appAccess.${app}.dashboard`, '==', true).get();
}

export async function getRandomOrg(data: { app: App; access: ModuleAccess, userType: 'admin' | 'member'}) {
  const { app, access, userType } = data;
  const { docs } = access.dashboard ? await getDashboardOrgs(app) : await getMarketplaceOrgs(app);
  // TODO : when issue #8093 is resolved, revert below function code like in PR #7773
  let organization: Organization;
  do {
    const randomIndex = Math.floor(Math.random() * docs.length);
    const tempOrg = createOrganization(docs[randomIndex].data());
    const orgUser = await getRandomOrgUser(tempOrg.id, userType);
    if (orgUser?.email) organization = tempOrg;
  } while (!organization)
  return createOrganization(organization);
}

export async function validateOrg(orgName: string) {
  const org = await getOrgByName(orgName);
  const docRef = db.collection('orgs').doc(org.id);
  return docRef.update({ status: 'accepted' });
}

export async function getOrgByName(orgName: string) {
  const userQuery = await db.collection('orgs').where('denomination.full', '==', orgName).get();
  const [org] = userQuery.docs;
  if(!org) return null;
  return createOrganization(org.data());
}

export function deleteOrg(orgId: string) {
  return db.doc(`orgs/${orgId}`).delete();
}

//* USERS + ORGS

export async function acceptUserInOrg(userEmail: string) {
  const userQuery = await db.collection('invitations').where('fromUser.email', '==', userEmail).get();
  const [invitation] = userQuery.docs;
  const { id: invitationId } = invitation.data();
  return db.collection('invitations').doc(invitationId).update({ status: 'accepted' });
}

export async function getRandomOrgUser(orgId: string, type: 'admin' | 'member') {
  const permissionsRef = await db.doc(`permissions/${orgId}`).get();
  const permissions = createPermissions(permissionsRef.data());
  const userIds = Object.keys(permissions.roles).filter(uid =>
    type==='member' ? permissions.roles[uid] === 'member' : permissions.roles[uid] === 'superAdmin' || 'admin');
  const randomIndex = Math.floor(Math.random() * userIds.length);
  const userId = userIds[randomIndex];
  const userRef = await db.doc(`users/${userId}`).get();
  return createUser(userRef.data());
}

//* ORGS + MOVIES

async function getOrgMovies(orgId: string) {
  const movies = [];
  const userQuery = await db.collection('movies').where('orgIds', 'array-contains', orgId).get();
  userQuery.forEach(doc => movies.push(doc.data()));
  return movies.filter(movie => movie.title.international || movie.title.original);
}

//* ORGS + USERS + MOVIES

export async function getRandomScreeningData(data: { app: App, access: ModuleAccess, userType: 'admin' | 'member', moviesWithScreener?: boolean}) {
  const { app, access, userType, moviesWithScreener } = data;
  let result = {};
  do {
    const org = await getRandomOrg({app, access, userType});
    const user = await getRandomOrgUser(org.id, userType);
    let movies = (await getOrgMovies(org.id))
      .filter(movie => movie.title.international && movie.app.festival.status == "accepted" && movie.app.festival.access == true);
    if(!isUndefined(moviesWithScreener)) movies = movies.filter(movie => moviesWithScreener ? movie.promotional.videos.screener.jwPlayerId : !movie.promotional.videos.screener.jwPlayerId);
    if (movies.length) result = { org, user, movies };
  } while (!Object.keys(result).length);
  return result;
}

export async function getRandomScreeningDataArray(data: { app: App; access: ModuleAccess, userType: 'admin' | 'member', number: number, moviesWithScreener: boolean}) {
  const { app, access, userType, number, moviesWithScreener } = data;
  const result= [];
  for( let i = 0; i < number; i++) {
    result.push(await getRandomScreeningData({app, access, userType, moviesWithScreener}));
  }
  return result;
}
