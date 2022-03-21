import { db, auth } from '../testing-cypress';
import { User, Organization } from '@blockframes/model'
import { App, ModuleAccess  } from '@blockframes/utils/apps';

export async function getRandomEmail() {
  const { email } = await getRandomUser();
  console.log(email);
  return email;
}

export async function getRandomUser() {
  const userQuery = await db.collection('users').get();
  return userQuery.docs[Math.floor(Math.random() * userQuery.docs.length)].data() as User;
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
  const userQuery = access.dashboard ? await getDashboardOrgs(app) : await getMarketplaceOrgs(app);
  return userQuery.docs[Math.floor(Math.random() * userQuery.docs.length)].data() as Organization;
}

export async function validateOrg(orgName: string) {
  const userQuery = await db.collection('orgs').where('denomination.full', '==', orgName).get();
  const org = userQuery.docs.pop().data();
  const orgId = org.id;
  const docRef = db.collection('orgs').doc(orgId);
  return docRef.update({ status: 'accepted' });
}

export async function acceptUserInOrg(userEmail: string) {
  const user = await auth.getUserByEmail(userEmail);
  const userQuery = await db.collection('invitations').where('fromUser.uid', '==', user.uid).get();
  const invitation = userQuery.docs.pop().data();
  return db.collection('invitations').doc(invitation.id).update({ status: 'accepted' });
}
