import { db } from '../testing-cypress';
import { metaDoc } from '@blockframes/utils/maintenance';
import { WhereFilterOp } from 'firebase/firestore';
import { BucketTerm, createDuration } from '@blockframes/model';

const isDocumentPath = (path: string) => path.split('/').length % 2 === 0;
const isEventsPath = (path: string) => path.split('/')[0] === 'events';
const isTermsPath = (path: string) => path.split('/')[0] === 'terms';
const isNegotiationPath = (path: string) => path.split('/').length > 2 && path.split('/')[2] === 'negotiations';

//* IMPORT DATA*-----------------------------------------------------------------

export function importData(data: Record<string, object>[]) {
  const createAll: Promise<FirebaseFirestore.WriteResult>[] = [];
  for (const document of data) {
    Object.entries(document).map(([path, content]) => {
      if (!isDocumentPath(path)) {
        throw new Error('Document path mandatory, like [collectionPath/DocumentPath]. Got ' + JSON.stringify(path));
      }

      if (path === metaDoc) {
        content = {
          startedAt: !content['startedAt'] ? null : new Date(content['startedAt']), // TODO #8614
          endedAt: !content['endedAt'] ? null : new Date(content['endedAt']), // TODO #8614
        };
      } else if (isEventsPath(path)) {
        content = {
          ...content,
          start: new Date(content['start']), // TODO #8614
          end: new Date(content['end']), // TODO #8614
        };
      } else if (isTermsPath(path)) {
        content = {
          ...content,
          duration: createDuration(content['duration']),
        };
      } else if (isNegotiationPath(path)) {
        content['terms'].forEach((t: BucketTerm) => {
          t.duration = createDuration(t.duration);
        });
        content['initial'] = new Date(content['initial']);
      }
      content['_meta'] =
        content['_meta'] && content['_meta']['createdAt']
          ? { e2e: true, createdAt: new Date(content['_meta']['createdAt']) }
          : { e2e: true };

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
  return deleteData(docsToDelete);
}

export async function queryDelete(data: { collection: string; field: string; operator: WhereFilterOp; value: unknown }) {
  const { collection, field, operator, value } = data;
  const snapshot = await db.collection(collection).where(field, operator, value).get();
  const batch = db.batch();
  const docs = snapshot.docs;
  const deletedData = docs.map(doc => doc.data());
  for (const doc of docs) batch.delete(doc.ref);
  return batch.commit().then(() => deletedData);
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
