import { db } from '../testing-cypress';
import { createUser, createOrganization, createPermissions, ModuleAccess, App } from '@blockframes/model';
import { metaDoc } from '@blockframes/utils/maintenance';
import { WhereFilterOp } from 'firebase/firestore';

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
    return permissions.roles[userId] === 'superAdmin' || permissions.roles[userId] === 'admin';
  });
  const randomIndex = Math.floor(Math.random() * adminIds.length);
  const adminId = adminIds[randomIndex];
  const adminRef = await db.doc(`users/${adminId}`).get();
  return createUser(adminRef.data());
}

// function commented because an existing test depends on it, and it has the same name as a new crud function
// will be deleting shortly
/* export function deleteUser(userId: string) {
  return db.doc(`users/${userId}`).delete();
} */

export async function getOrgByName(orgName: string) {
  const userQuery = await db.collection('orgs').where('name', '==', orgName).get();
  const [org] = userQuery.docs;
  if (!org) return null;
  return createOrganization(org.data());
}

export function deleteOrg(orgId: string) {
  return db.doc(`orgs/${orgId}`).delete();
}

//* LIGHT PLUGIN*----------------------------------------------------------------

const isDocumentPath = (path: string) => path.split('/').length % 2 === 0;
const isEventsPath = (path: string) => path.split('/')[0] === 'events';

//* IMPORT DATA*-----------------------------------------------------------------

export async function importData(data: Record<string, object>[]) {
  const createAll: Promise<FirebaseFirestore.WriteResult>[] = [];
  for (const document of data) {
    Object.entries(document).map(([path, content]) => {
      if (!isDocumentPath(path))
        throw new Error('Document path mandatory, like [collectionPath/DocumentPath]. Got ' + JSON.stringify(path));
      if (path === metaDoc)
        content = {
          startedAt: !content['startedAt'] ? null : new Date(content['startedAt']),
          endedAt: !content['endedAt'] ? null : new Date(content['endedAt']),
        };
      else if (isEventsPath(path)) {
        content = {
          ...content,
          start: new Date(content['start']),
          end: new Date(content['end']),
          _meta: { e2e: true },
        };
      } else if ('_meta' in content) content['_meta']['e2e'] = true;
      else content['_meta'] = { e2e: true };
      createAll.push(db.doc(path).set(content));
    });
  }
  return Promise.all(createAll);
}

//* DELETE DATA*----------------------------------------------------------------

export async function deleteData(paths: string[]) {
  const deleteAll: Promise<FirebaseFirestore.WriteResult>[] = [];
  for (const path of paths) {
    if (isDocumentPath(path)) {
      const subcollectionsDocs = await subcollectionsDocsOf(path);
      for (const doc of subcollectionsDocs) deleteAll.push(doc.delete());
      deleteAll.push(db.doc(path).delete());
    } else {
      const docsRef = await db.collection(path).listDocuments();
      for (const docRef of docsRef) {
        const subcollectionsDocs = await subcollectionsDocsOf(docRef.path);
        for (const doc of subcollectionsDocs) deleteAll.push(doc.delete());
        deleteAll.push(docRef.delete());
      }
    }
  }
  return Promise.all(deleteAll);
}

const subcollectionsDocsOf = async (path: string) => {
  const result: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>[] = [];
  const subcollections = await db.doc(path).listCollections();
  for (const subcollection of subcollections) {
    const subdocs = await subcollection.listDocuments();
    for (const subdoc of subdocs) result.push(subdoc);
  }
  return result;
};

export async function clearTestData() {
  const docsToDelete: string[] = [];
  const collections = await db.listCollections();
  for (const collection of collections) {
    const snapshot = await collection.where('_meta.e2e', '==', true).get();
    const docs = snapshot.docs;
    for (const doc of docs) docsToDelete.push(`${collection.id}/${doc.id}`);
  }
  await deleteData(docsToDelete);
}

//* GET DATA*------------------------------------------------------------------

export async function getData(paths: string[]) {
  const getAll: Promise<Record<string, unknown> | Record<string, unknown>[]>[] = [];
  for (const path of paths) {
    if (isDocumentPath(path)) {
      const docData = getDocument(path);
      getAll.push(docData);
    } else {
      const collectionData = getCollection(path);
      getAll.push(collectionData);
    }
  }
  return Promise.all(getAll);
}

async function getDocument(path: string) {
  const docSnap = await db.doc(path).get();
  const docData = docSnap.data();
  const subcollectionsData = await subcollectionsDataOf(path);
  const result = { ...docData, ...subcollectionsData };
  return result;
}

async function getCollection(collection: string) {
  const result = [];
  const docRefs = await db.collection(collection).listDocuments();
  for (const docRef of docRefs) {
    const docData = await getDocument(docRef.path);
    result.push(docData);
  }
  return result;
}

const subcollectionsDataOf = async (path: string) => {
  const result = {};
  const subcollections = await db.doc(path).listCollections();
  for (const subcollection of subcollections) {
    const subdocs = await subcollection.listDocuments();
    const subdocsData = [];
    for (const subdoc of subdocs) {
      const subDocSnap = await subdoc.get();
      const subdocData = subDocSnap.data();
      subdocsData.push(subdocData);
    }
    result[`${subcollection.id}`] = subdocsData;
  }
  return result;
};

export async function queryData(data: { collection: string; field: string; operator: WhereFilterOp; value: unknown }) {
  const { collection, field, operator, value } = data;
  const snapshot = await db.collection(collection).where(field, operator, value).get();
  return snapshot.docs.map(doc => doc.data());
}

//* UPDATE DATA*-----------------------------------------------------------------

export async function updateData(data: { docPath: string; field: string; value: unknown }[]) {
  const updateAll: Promise<FirebaseFirestore.WriteResult>[] = [];
  for (const update of data) {
    const { docPath, field, value } = update;
    if (!isDocumentPath(docPath))
      throw new Error('Document path mandatory, like [collectionPath/DocumentPath]. Got ' + JSON.stringify(docPath));
    const docRef = db.doc(docPath);
    updateAll.push(docRef.update({ [field]: value }));
  }
  return Promise.all(updateAll);
}
