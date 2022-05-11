import { db } from '../testing-cypress';
import { createUser, createOrganization, Organization, createPermissions } from '@blockframes/model';
import { App, ModuleAccess } from '@blockframes/model';

export async function getRandomEmail() {
  const { email } = await getRandomUser();
  console.log(email);
  return email;
}

export async function getRandomUser() {
  const { docs } = await db.collection('users').get();
  const randomIndex = Math.floor(Math.random() * docs.length);
  return createUser(docs[randomIndex].data());
}

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

export async function getRandomOrg(data: { app: App; access: ModuleAccess }) {
  const { app, access } = data;
  const { docs } = access.dashboard ? await getDashboardOrgs(app) : await getMarketplaceOrgs(app);
  const ramdomIndex = Math.floor(Math.random() * docs.length);
  return createOrganization(docs[ramdomIndex].data());
}

export async function validateOrg(orgName: string) {
  const org = await getOrgByName(orgName);
  const docRef = db.collection('orgs').doc(org.id);
  return docRef.update({ status: 'accepted' });
}

export async function acceptUserInOrg(userEmail: string) {
  const userQuery = await db.collection('invitations').where('fromUser.email', '==', userEmail).get();
  const [invitation] = userQuery.docs;
  const { id: invitationId } = invitation.data();
  return db.collection('invitations').doc(invitationId).update({ status: 'accepted' });
}

export async function getRandomOrgAdmin(orgId: string) {
  const permissionsRef = await db.doc(`permissions/${orgId}`).get();
  const permissions = createPermissions(permissionsRef.data());
  const adminIds = Object.keys(permissions.roles).filter(userId => {
    return (
      permissions.roles[userId] === 'superAdmin' ||
      permissions.roles[userId] === 'admin'
    );
  });
  const randomIndex = Math.floor(Math.random() * adminIds.length);
  const adminId = adminIds[randomIndex];
  const adminRef = await db.doc(`users/${adminId}`).get();
  return createUser(adminRef.data());
}

export function deleteUser(userId: string) {
  return db.doc(`users/${userId}`).delete();
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

const isDocumentPath = (path: string) => path.split('/').length % 2 === 0;

export async function importData(data: any | any[]) {
  // Array of Promises to create all documents in the data
  const createAll = Object.entries(data).map(([path, content]) => {
    // If document create doc
    if (isDocumentPath(path)) {
      const docRef = db.doc(path);
      return docRef.set(content);
    }
    // If collection, add all documents
    if (!Array.isArray(content)) {
      throw new Error('If path is a collection, the content should be an array. Got ' + JSON.stringify(content));
    }
    const docRef = db.collection(path);
    const addAll = content.map(document => docRef.doc().create(document));
    return Promise.all(addAll);
  });
  // wait for all promises to finish
  return Promise.all(createAll);
}

export async function deleteData(path: string) {
  // if only name of a collection, erase all its data
  if (!isDocumentPath(path)) {
    const docsRef = await db.collection(path).listDocuments();
    return docsRef.every(doc => doc.delete());
  }
  // if doc path, delete doc
  return db.doc(path).delete();
}