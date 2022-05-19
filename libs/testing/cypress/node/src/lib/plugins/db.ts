import { db } from '../testing-cypress';
import { createUser, createOrganization, createPermissions } from '@blockframes/model';
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
    return permissions.roles[userId] === 'superAdmin' || permissions.roles[userId] === 'admin';
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
  if (!org) return null;
  return createOrganization(org.data());
}

export function deleteOrg(orgId: string) {
  return db.doc(`orgs/${orgId}`).delete();
}

// TODO : create a CRUD light plugin, see issue #8460

//* LIGHT PLUGIN*----------------------------------------------------------------

const isDocumentPath = (path: string) => path.split('/').length % 2 === 0;

//* IMPORT DATA*-----------------------------------------------------------------

export async function importData(data: Record<string, object>[]) {
  const createAll: Promise<FirebaseFirestore.WriteResult>[] = [];
  for (const document of data) {
    Object.entries(document).map(([path, content]) => {
      if (!isDocumentPath(path))
        throw new Error('Document path mandatory, like [collectionPath/DocumentPath]. Got ' + JSON.stringify(path));
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
      subcollectionsDocs.forEach(doc => deleteAll.push(doc.delete()));
      deleteAll.push(db.doc(path).delete());
    } else {
      const docsRef = await db.collection(path).listDocuments();
      docsRef.forEach(async docRef => {
        const subcollectionsDocs = await subcollectionsDocsOf(docRef.path);
        subcollectionsDocs.forEach(doc => deleteAll.push(doc.delete()));
        deleteAll.push(docRef.delete());
      });
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

//* UPDATE DATA*-----------------------------------------------------------------

//TODO : adapt to use id of doc or uid for users #8460

/*
export function updateData(data: any | any[]) {
  const createAll = Object.entries(data).map(([path, content]) => {
    if (isDocumentPath(path)) {
      const docRef = db.doc(path);
      return docRef.update(content);
    }
    if (!Array.isArray(content)) {
      throw new Error('If path is a collection, the content should be an array. Got ' + JSON.stringify(content));
    }
    const collRef = db.collection(path);
    const addAll = content.map(document => collRef.doc().update(document));
    return Promise.all(addAll);
  });
  return Promise.all(createAll);
}
*/
