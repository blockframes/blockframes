import { db } from '../testing-cypress';
import { createUser, createOrganization, Organization, createPermissions, UserRole, MovieDocument } from '@blockframes/model';
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

export async function getRandomMember(data: { app: App; access: ModuleAccess, userType: UserRole}) {
  const { userType } = data;
  const org = await getRandomOrg(data);
  return getRandomOrgMember({ orgId: org.id, userType })
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

export async function getRandomOrg(data: { app: App; access: ModuleAccess, userType: UserRole}) {
  const { app, access, userType } = data;
  const { docs } = access.dashboard ? await getDashboardOrgs(app) : await getMarketplaceOrgs(app);
  // TODO : when issue #8093 is resolved, revert below function code like in PR #7773
  let organization: Organization;
  do {
    const randomIndex = Math.floor(Math.random() * docs.length);
    const tempOrg = createOrganization(docs[randomIndex].data());
    const orgUser = await getRandomOrgMember({ orgId: tempOrg.id, userType });
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

export async function getRandomOrgMember(data: {orgId: string, userType: UserRole}) {
  const { orgId, userType } = data;
  const permissionsRef = await db.doc(`permissions/${orgId}`).get();
  const permissions = createPermissions(permissionsRef.data());
  const userIds = Object.keys(permissions.roles).filter(uid =>
    userType==='member' ? permissions.roles[uid] === 'member' : permissions.roles[uid] === 'superAdmin' || 'admin');
  const randomIndex = Math.floor(Math.random() * userIds.length);
  const userId = userIds[randomIndex];
  const userRef = await db.doc(`users/${userId}`).get();
  return createUser(userRef.data());
}

//* ORGS + MOVIES

async function getOrgMovies(orgId: string) {
  const movieSnap = await db.collection('movies').where('orgIds', 'array-contains', orgId).get();
  const movies = movieSnap.docs.map(doc => doc.data() as MovieDocument);
  return movies.filter(movie => movie.title.international);
}

//* ORGS + USERS + MOVIES

export async function getRandomScreeningData(data: { app: App, access: ModuleAccess, userType: UserRole, moviesWithScreener?: boolean}) {
  const { app, access, userType, moviesWithScreener } = data;
  let result = {};
  do {
    const org = await getRandomOrg({ app, access, userType });
    const user = await getRandomOrgMember({ orgId: org.id, userType });
    const orgMovies = await getOrgMovies(org.id);
    let movies = orgMovies.filter(movie => movie.title.international && movie.app.festival.status === 'accepted' && movie.app.festival.access === true);
    if(!isUndefined(moviesWithScreener)) movies = movies.filter(movie => {
      const jwPlayerId = movie.promotional.videos.screener.jwPlayerId;
      return moviesWithScreener ? jwPlayerId : !jwPlayerId;
    });
    if (movies.length) result = { org, user, movies };
  } while (!Object.keys(result).length);
  return result;
}

export async function getRandomScreeningDataArray(data: { app: App; access: ModuleAccess, userType: UserRole, number: number, moviesWithScreener: boolean}) {
  const { app, access, userType, number, moviesWithScreener } = data;
  const promises= [];
  for( let i = 0; i < number; i++) {
    promises.push(getRandomScreeningData({app, access, userType, moviesWithScreener}));
  }
  return Promise.all(promises);
}

//* EVENTS

export function deleteEvent(eventId: string) {
  return db.doc(`events/${eventId}`).delete();
}

export async function getAllSellerEventIds(sellerUid: string) {
  const sellerOrgSnap = await db.collection('users').doc(sellerUid).get();
  const sellerOrgUid = sellerOrgSnap.get('orgId') as string;
  console.log(`This seller's OrgId is: ${sellerOrgUid}`);
  const eventsSnap = await db.collection('events').where('ownerOrgId', '==', sellerOrgUid).get();
  console.log(`There were ${eventsSnap.size} events found for this org`);
  return eventsSnap.docs.map(doc => doc.id);
}

export async function deleteAllSellerEvents(sellerUid: string) {
  const eventIds = await getAllSellerEventIds(sellerUid);
  const promises = [];
  for(const eventId of eventIds) {
    promises.push(deleteEvent(eventId))
  }
  return Promise.all(promises)
}