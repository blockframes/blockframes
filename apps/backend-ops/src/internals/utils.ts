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
    'contracts'
  ],
  campaigns: [
    'orgId'
  ],
  offers: [
    'buyerId'
  ],
  permissions: [''] // document id
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
  let count = 0;
  collectionData.forEach(c => count = count + c.refs.docs.length);
  return count;
}

//////////////////
// Methods to fetch relations between database objects
//////////////////

export function inspectDocumentRelations(
  inspectedDocument: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>,
  collections: CollectionData[],
  mapName: 'users' | 'orgs',
  verbose = false
) {

  const inspectionResult: DocumentDescriptor[] = [];
  for (const collection of collections) {
    for (const document of collection.refs.docs) {
      if (dataMap[mapName][collection.name]) { // @TODO #6460 invert with previous line
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

function isMatchingValue(stringToFind: string, document: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>, attr: string) {
  if (!stringToFind) return;

  if (attr === '') {
    return stringToFind === document.id;
  }

  if (attr.endsWith('{}')) {
    const val = getValue(document.data(), attr.replace('{}', ''));
    return !!val[stringToFind];
  } else {
    const val = getValue(document.data(), attr);
    if (Array.isArray(val)) {
      return val.some(v => isString(v) ? v === stringToFind : JSON.stringify(v).indexOf(stringToFind));  // for object or string arrays
    } else {
      return val === stringToFind;
    }
  }

}

//////////////////
// Methods to audit db data
//////////////////

export function auditConsistency(dbData: DatabaseData, collections: CollectionData[], auditedCollectionName: 'users' | 'orgs') {
  const auditedCollection = dbData[auditedCollectionName];
  const collectionsToAudit = collections.filter(c => c.name !== auditedCollection.name);

  const consistencyErrors: { auditedCollection: Collections, missingDocId: string, in: { collection: Collections, docId: string, field: string } }[] = [];
  for (const collection of collectionsToAudit) {
    // For this collection, let check if references of auditedCollection ids all belongs to an existing document of auditedCollection$
    for (const document of collection.refs.docs) {
      if (dataMap[auditedCollectionName][collection.name]) {
        for (const field of dataMap[auditedCollectionName][collection.name]) {
          if (field === '') {
            if (!auditedCollection.refs.docs.find(d => d.id === document.id)) {
              consistencyErrors.push({ auditedCollection: auditedCollectionName, missingDocId: document.id, in: { collection: collection.name, docId: document.id, field } });
            }
          } else if (field.endsWith('{}')) {
            const val = getValue(document.data(), field.replace('{}', ''));
            for (const entry of Object.keys(val)) {
              if (!auditedCollection.refs.docs.find(d => d.id === entry)) {
                consistencyErrors.push({ auditedCollection: auditedCollectionName, missingDocId: entry, in: { collection: collection.name, docId: document.id, field } });
              }
            }
          } else {
            const val = getValue(document.data(), field);
            if (!val && !['_meta.deletedBy', '_meta.createdBy', '_meta.updatedBy', 'user.uid', 'fromUser.uid', 'toUser.uid', 'meta.organizerUid', 'buyerUserId', 'uid',
              'organization.id', 'fromOrg.id', 'toOrg.id'].includes(field)) { // @TODO #6460 do the same for orgs audit and remove
              console.log(field, collection.name, document.id)
            }
            if (val && !['internal', 'anonymous'].includes(val)) {
              if (Array.isArray(val)) {
                if (!val.length) { // @TODO #6460 do the same for orgs audit and remove
                  if (!['canRead', 'canUpdate', 'canCreate', 'canDelete'].includes(field)) {
                    console.log(field, collection.name, document.id)
                  }

                } else if (val.length) {
                  for (const entry of val) {
                    if (isString(entry)) {
                      if (!auditedCollection.refs.docs.find(d => d.id === entry)) {
                        consistencyErrors.push({ auditedCollection: auditedCollectionName, missingDocId: entry, in: { collection: collection.name, docId: document.id, field } });
                      }
                    } else {
                      console.log(val)
                      //return val.some(v => isString(v) ? v === stringToFind : JSON.stringify(v).indexOf(stringToFind));  // for object or string arrays
                    }
                  }
                }
              } else if (!auditedCollection.refs.docs.find(d => d.id === val)) {
                consistencyErrors.push({ auditedCollection: auditedCollectionName, missingDocId: val, in: { collection: collection.name, docId: document.id, field } });
              }
            }
          }
        }
      }
    }
  }

  return consistencyErrors;

}