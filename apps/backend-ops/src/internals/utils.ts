import { getValue } from "@blockframes/utils/helpers";
import { isString } from "lodash";

const collections = {
  analytics: false, // @TODO #6460 handle ?
  blockframesAdmin: true,
  buckets: true,
  campaigns: true,
  cms: false, // @TODO #6460 handle ?
  contracts: true,
  docsIndex: true,
  events: true,
  invitations: true,
  movies: true,
  notifications: true,
  orgs: true,
  permissions: true,
  terms: false, // @TODO #6460 handle ?
  offers: true,
  users: true,
};

export type Collections = keyof typeof collections;

export interface CollectionData {
  name: Collections,
  documents: FirebaseFirestore.DocumentData[],
  refs: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
}

export type DatabaseData = Partial<Record<Collections, CollectionData>>;

/**
 * Map of user db document linked with other documents
 */
const userMap: Partial<Record<Collections, string[]>> = {
  notifications: [
    'toUserId',
    'user.uid',
    '_meta.createdBy',
    '_meta.updatedBy',
    '_meta.deletedBy'
  ],
  invitations: [
    'toUser.uid',
    'fromUser.uid'
  ],
  contracts: [
    'buyerUserId' // @TODO #6460 is field used ?
  ],
  offers: [
    'buyerUserId'
  ],
  buckets: [
    'uid' // @TODO #6460 is field used ?
  ],
  orgs: [
    'userIds',
    '_meta.createdBy',
    '_meta.updatedBy',
    '_meta.deletedBy'
  ],
  permissions: [
    'roles{}',
    'canCreate',// @TODO #6460 is field used ?
    'canRead',// @TODO #6460 is field used ?
    'canUpdate',// @TODO #6460 is field used ?
    'canDelete',// @TODO #6460 is field used ?
  ],
  blockframesAdmin: [''], // document id
  events: [
    'meta.organizerUid'
  ],
  movies: [
    '_meta.createdBy',
    '_meta.updatedBy',
    '_meta.deletedBy'
  ]
}

/**
 * Map of org db document linked with other documents
 */
const orgMap: Partial<Record<Collections, string[]>> = {
  events: [
    'ownerOrgId'
  ],
  notifications: [
    'organization.id',
  ],
  invitations: [
    'fromOrg.id',
    'toOrg.id'
  ],
  contracts: [
    'buyerId',
    'sellerId',
    'stakeholders',
  ],
  movies: [
    'orgIds'
  ],
  buckets: [
    '', // document id
    'contracts[].orgId'
  ],
  campaigns: [
    'orgId'
  ],
  offers: [
    'buyerId'
  ],
  users: [
    'orgId'
  ],
  permissions: [''] // document id
}

// @TODO #6460 title map ?

const dataMap = { users: userMap, orgs: orgMap };

export type DocumentDescriptor = { collection: Collections, docId: string };

//////////////////
// Methods to load db data
//////////////////

export async function loadAllCollections(db: FirebaseFirestore.Firestore): Promise<{ dbData: DatabaseData, collectionData: CollectionData[] }> {
  const filteredCollections = Object.entries(collections).map(([name, active]) => active ? name : undefined).filter(c => c);
  const data = await Promise.all(filteredCollections.map(c => db.collection(c).get()));

  const dbData: DatabaseData = {};
  filteredCollections.forEach((name, index) => dbData[name] = {
    name,
    documents: data[index].docs.map(d => d.data()),
    refs: data[index]
  } as CollectionData);

  return { dbData, collectionData: Object.values(dbData) };
}

export async function getAllDocumentCount(db: FirebaseFirestore.Firestore) {
  const { collectionData } = await loadAllCollections(db);
  let count = 0;
  collectionData.forEach(c => count = count + c.refs.docs.length);
  return count;
}

//////////////////
// Methods to fetch relations between database objects
//////////////////

export function inspectDocumentRelations(
  inspectedDocument: FirebaseFirestore.DocumentData,
  collections: CollectionData[],
  mapName: 'users' | 'orgs',
  verbose = false
) {

  const inspectionResult: DocumentDescriptor[] = [];
  for (const collection of collections) {
    if (dataMap[mapName][collection.name]) {
      for (const document of collection.refs.docs) {
        for (const attr of dataMap[mapName][collection.name]) {
          if (isMatchingValue(inspectedDocument.id, document, attr)) {
            const docId = document.id;
            if (verbose) {
              console.log(`Found document ${inspectedDocument.id} in ${collection.name}/${docId} in attr ${attr || 'documentId'}`);
            }

            inspectionResult.push({ collection: collection.name, docId });
          }
        }
      }
    }
  }

  return inspectionResult;
}

function isMatchingValue(documentIdToFind: string, document: FirebaseFirestore.DocumentData, field: string) {
  const candidates = getCandidates(document, field);
  return candidates.includes(documentIdToFind);
}

//////////////////
// Methods to audit db data
//////////////////
export interface ConsistencyError {
  auditedCollection?: Collections,
  missingDocId: string,
  in: {
    collection?: Collections,
    docId: string,
    field: string
  }
};

export function auditConsistency(dbData: DatabaseData, collections: CollectionData[], auditedCollectionName: 'users' | 'orgs') {
  const auditedCollection = dbData[auditedCollectionName];
  const auditedCollectionIds = auditedCollection.refs.docs.map(d => d.id);
  const collectionsToAudit = collections.filter(c => c.name !== auditedCollection.name);

  const consistencyErrors: ConsistencyError[] = [];
  for (const collection of collectionsToAudit) {
    // For this collection, let check if references of auditedCollection ids all belongs to an existing document of auditedCollection
    for (const document of collection.refs.docs) {
      if (dataMap[auditedCollectionName][collection.name]) {
        for (const _field of dataMap[auditedCollectionName][collection.name]) {
          getConsitencyErrors(auditedCollectionIds, document, _field).forEach(c => {
            consistencyErrors.push({
              ...c,
              auditedCollection: auditedCollectionName,
              in: { ...c.in, collection: collection.name }
            });
          })
        }
      }
    }
  }
  return consistencyErrors;
}

function getConsitencyErrors(documentIdsToFind: string[], document: FirebaseFirestore.DocumentData, field: string) {
  const consistencyErrors: ConsistencyError[] = [];

  const candidates = getCandidates(document, field);

  for (const entry of candidates) {
    if (!documentIdsToFind.find(id => id === entry)) {
      consistencyErrors.push({ missingDocId: entry, in: { docId: document.id, field } });
    }
  }

  return consistencyErrors;
}


function getCandidates(document: FirebaseFirestore.DocumentData, _field: string): string[] {
  const field = _field.split('[].')[0];
  const fieldSuffix = _field.split('[].')[1];

  if (field === '') {
    return [document.id];
  } else if (field.endsWith('{}')) {
    const val = getValue(document.data(), field.replace('{}', ''));
    return Object.keys(val);
  } else {
    let val = getValue(document.data(), field);
    if (!val || ['internal', 'anonymous'].includes(val)) return [];
    if (!Array.isArray(val)) val = [val];
    if (!val.length) return [];

    return val.map(entry => {
      const idToFind = isString(entry) ? entry : getValue(entry, fieldSuffix);
      if (!idToFind) console.log('UnHandled error..');
      return idToFind;
    }).filter(d => !!d);
  }
}