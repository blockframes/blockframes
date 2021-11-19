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

type DatabaseData = Partial<Record<Collections, CollectionData>>;

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
    'roles',
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

const dataMap = { user: userMap, org: orgMap };

export type DocumentDescriptor = { collection: Collections, docId: string };

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

export function inspectDocumentRelations(
  user: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>,
  collections: CollectionData[],
  mapName: 'user' | 'org',
  verbose = false
) {

  const inspectionResult: DocumentDescriptor[] = [];
  for (const collection of collections) {
    for (const document of collection.refs.docs) {
      if (dataMap[mapName][collection.name]) {
        for (const attr of dataMap[mapName][collection.name]) {
          if (isMatchingValue(user.id, document, attr, collection.name)) {
            const docId = document.id;
            if (verbose) {
              console.log(`Found document ${user.id} in ${collection.name}/${docId} in attr ${attr || 'documentId'}`);
            }

            inspectionResult.push({ collection: collection.name, docId });
          }
        }
      }
    }
  }

  return inspectionResult;
}

function isMatchingValue(stringToFind: string, document: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>, attr: string, collectionName: Collections) {
  if (!stringToFind) return;

  if (attr == '') {
    return stringToFind === document.id;
  }

  const val = getValue(document.data(), attr);

  if (collectionName === 'permissions' && attr === 'roles') {
    return !!val[stringToFind];
  } else if (Array.isArray(val)) {
    return val.some(v => isString(v) ? v === stringToFind : JSON.stringify(v).indexOf(stringToFind));  // for object or string arrays
  } else {
    return val === stringToFind;
  }
}