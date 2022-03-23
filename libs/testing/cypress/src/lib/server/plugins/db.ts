import { db } from '../testing-cypress';
import { createUser, createOrganization } from '@blockframes/model'
import { App, ModuleAccess  } from '@blockframes/utils/apps';

export async function getRandomEmail() {
  const { email } = await getRandomUser();
  console.log(email);
  return email;
}

async function getRandomUser() {
  const { docs } = await db.collection('users').get();
  const ramdomIndex = Math.floor(Math.random() * docs.length);
  return createUser(docs[ramdomIndex].data());
}

function getMarketplaceOrgs(app: App) {
  return db.collection('orgs')
    .where('status', '==', 'accepted')
    .where(`appAccess.${app}.marketplace`, '==', true)
    .where(`appAccess.${app}.dashboard`, '==', false)
    .get();
}

function getDashboardOrgs(app: App) {
  return db.collection('orgs')
    .where('status', '==', 'accepted')
    .where(`appAccess.${app}.dashboard`, '==', true)
    .get();
}

export async function getRandomOrg(data: { app: App; access: ModuleAccess }) {
  const { app, access } = data;
  const { docs } = access.dashboard ? await getDashboardOrgs(app) : await getMarketplaceOrgs(app);
  const ramdomIndex = Math.floor(Math.random() * docs.length);
  return createOrganization(docs[ramdomIndex].data());
}

export async function validateOrg(orgName: string) {
  const userQuery = await db.collection('orgs').where('denomination.full', '==', orgName).get();
  const [org] = userQuery.docs;
  const { id: orgId } = org.data();
  const docRef = db.collection('orgs').doc(orgId);
  return docRef.update({ status: 'accepted' });
}

export async function acceptUserInOrg(userEmail: string) {
  const userQuery = await db.collection('invitations').where('fromUser.email', '==', userEmail).get();
  const [invitation] = userQuery.docs;
  const { id: invitationId } = invitation.data();
  return db.collection('invitations').doc(invitationId).update({ status: 'accepted' });
}
