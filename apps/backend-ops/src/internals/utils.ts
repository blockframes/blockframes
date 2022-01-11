import { getValue } from "@blockframes/utils/helpers";
import { isString } from "lodash";

const collections = {
  analytics: false,
  blockframesAdmin: true,
  buckets: true,
  campaigns: true,
  cms: false,
  consents: false,
  contracts: true,
  docsIndex: true,
  events: true,
  incomes: false,
  invitations: true,
  movies: true,
  notifications: true,
  offers: true,
  orgs: true,
  permissions: true,
  terms: false,
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
    'buyerUserId'
  ],
  offers: [
    'buyerUserId'
  ],
  buckets: [
    'uid'
  ],
  orgs: [
    'userIds',
    '_meta.createdBy',
    '_meta.updatedBy',
    '_meta.deletedBy'
  ],
  permissions: [
    'roles{}',
    'canCreate',
    'canRead',
    'canUpdate',
    'canDelete',
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
  permissions: [''], // document id
  docsIndex: [
    'authorOrgId'
  ]
}

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
  return collectionData.reduce((sum, collection) => sum + collection.refs.docs.length, 0);
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
interface ConsistencyError {
  auditedCollection?: Collections,
  missingDocId: string,
  in: {
    collection?: Collections,
    docId: string,
    field: string
  }
};

function auditConsistency(dbData: DatabaseData, collections: CollectionData[], auditedCollectionName: 'users' | 'orgs') {
  const auditedCollection = dbData[auditedCollectionName];
  const auditedCollectionIds = auditedCollection.refs.docs.map(d => d.id);
  const collectionsToAudit = collections.filter(c => c.name !== auditedCollection.name);

  const consistencyErrors: ConsistencyError[] = [];
  for (const collection of collectionsToAudit) {
    // For this collection, let check if references of auditedCollection ids all belongs to an existing document of collectionsToAudit
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

export async function printDatabaseInconsistencies(
  data?: { dbData: DatabaseData, collectionData: CollectionData[] },
  db?: FirebaseFirestore.Firestore,
  options = { printDetail: true }
) {

  // Getting all collections we need to check
  const { dbData, collectionData } = data || await loadAllCollections(db);

  const usersOutput = auditConsistency(dbData, collectionData, 'users');
  console.log(`Found ${usersOutput.length} inconsistencies when auditing users (${usersOutput.filter(o => o.in.field.indexOf('_meta') === 0).length} in _meta).`);

  if (options.printDetail) usersOutput.forEach(printInconsistency);

  const orgsOutput = auditConsistency(dbData, collectionData, 'orgs');
  console.log(`Found ${orgsOutput.length} inconsistencies when auditing orgs (${orgsOutput.filter(o => o.in.field.indexOf('_meta') === 0).length} in _meta).`);

  if (options.printDetail) orgsOutput.forEach(printInconsistency);

  return true;
}

function printInconsistency(inconsistency: ConsistencyError) {
  const { in: foundIn, missingDocId, auditedCollection } = inconsistency;
  console.log(`Missing ${auditedCollection} in ${foundIn.collection}/${foundIn.docId}/${foundIn.field}.${missingDocId}`);
}


function getCandidates(document: FirebaseFirestore.DocumentData, _field: string): string[] {
  const [field, fieldSuffix] = _field.split('[].');

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