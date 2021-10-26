import { ContractDocument } from "@blockframes/contract/contract/+state";
import { connectFirestoreEmulator, defaultEmulatorBackupPath, endMaintenance, firebaseEmulatorExec, getFirestoreExportPath, importFirestoreEmulatorBackup, latestAnonDbDir, latestAnonShrinkedDbDir, loadAdminServices, removeAllSubcollections, shutdownEmulator, startMaintenance } from "@blockframes/firebase-utils";
import { InvitationDocument } from "@blockframes/invitation/+state/invitation.firestore";
import { MovieDocument } from "@blockframes/movie/+state/movie.firestore";
import { NotificationDocument } from "@blockframes/notification/types";
import { OrganizationDocument } from "@blockframes/organization/+state";
import { PermissionsDocument } from "@blockframes/permissions/+state/permissions.firestore";
import { uploadBackup } from "./emulator";
import { backupBucket as ciBucketName } from 'env/env.blockframes-ci'
import { EventDocument } from "@blockframes/event/+state/event.firestore";
import { Offer } from "@blockframes/contract/offer/+state";
import { Bucket } from "@blockframes/contract/bucket/+state";
import { getValue } from "@blockframes/utils/helpers";
import { isString } from "lodash";
import { Campaign } from "@blockframes/campaign/+state/campaign.model";

// Users for E2E tests
import staticUsers from 'tools/static-users.json';
import { EIGHT_MINUTES_IN_MS } from "@blockframes/utils/maintenance";
import type * as admin from 'firebase-admin';
import type { ChildProcess } from "child_process";

/**
 * Temp this should be removed when fixtures are updated. 
 *  - libs/e2e/src/lib/fixtures/users.ts
 *  - libs/e2e/src/lib/utils/screenings.ts
 */
const USERS = [
  'MDnN2GlVUeadIVJbzTToQQNAMWZ2',
  '2OJUZoWtTVcew27YDZa8FQQdg5q2',
  'K0ZCSd8bhwcNd9Bh9xJER9eP2DQ2',
  'B8UsXliuxwY6ztjtLuh6f7UD1GV2',
  'qFbytROWQYWJplzck42RLdgAr3K3',
  'mVUZ097xoAeubsPiQlqrzgUF8y83'
];

type Timestamp = admin.firestore.Timestamp;
type InspectionResult = { uid?: string, id?: string, collection: string, docId: string, attr: string };

const userMap = {
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
  organizations: [
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
    'organizerUid'
  ],
  movies: [
    '_meta.createdBy',
    '_meta.updatedBy',
    '_meta.deletedBy'
  ]
}

const orgMap = {
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
  movies: [
    'orgIds'
  ],
  buckets: [
    '', // document id
    'contracts'
  ],
  campaigns: [
    'orgId'
  ]
}

export async function loadAndShrinkLatestAnonDbAndUpload() {
  let proc: ChildProcess;
  try {
    // STEP 1 load-latest anon-db into emulator and keep it running with auth & firestore
    const importFrom = `gs://${ciBucketName}/${latestAnonDbDir}`;
    await importFirestoreEmulatorBackup(importFrom, defaultEmulatorBackupPath);

    proc = await firebaseEmulatorExec({
      emulators: 'firestore',
      importPath: defaultEmulatorBackupPath,
      exportData: true,
    });

    // STEP 2 shrink DB
    const db = connectFirestoreEmulator()
    await startMaintenance(db);
    await shrinkDb(db);
    await endMaintenance(db, EIGHT_MINUTES_IN_MS);

    // STEP 3 shutdown emulator & export db
    await shutdownEmulator(proc, defaultEmulatorBackupPath);

    // STEP 4 upload to backup bucket
    await uploadBackup({ localRelPath: getFirestoreExportPath(defaultEmulatorBackupPath), remoteDir: latestAnonShrinkedDbDir });

  } catch (e) {
    await shutdownEmulator(proc);
    throw e;
  }
}

export async function shrinkDb(db: FirebaseFirestore.Firestore) {
  const [
    _notifications,
    _invitations,
    _events,
    _movies,
    _organizations,
    _users,
    _permissions,
    _docsIndex,
    _contracts,
    _blockframesAdmin,
    _offers,
    _buckets,
    _campaigns
  ] = await Promise.all([
    db.collection('notifications').get(),
    db.collection('invitations').get(),
    db.collection('events').get(),
    db.collection('movies').get(),
    db.collection('orgs').get(),
    db.collection('users').get(),
    db.collection('permissions').get(),
    db.collection('docsIndex').get(),
    db.collection('contracts').get(),
    db.collection('blockframesAdmin').get(),
    db.collection('offers').get(),
    db.collection('buckets').get(),
    db.collection('campaigns').get(),
  ]);

  const notifications = _notifications.docs.map(d => d.data() as NotificationDocument);
  const invitations = _invitations.docs.map(d => d.data() as InvitationDocument);
  const events = _events.docs.map(d => d.data() as EventDocument<Timestamp>);
  const movies = _movies.docs.map(d => d.data() as MovieDocument);
  const organizations = _organizations.docs.map(d => d.data() as OrganizationDocument);
  const permissions = _permissions.docs.map(d => d.data() as PermissionsDocument);
  const contracts = _contracts.docs.map(d => d.data() as ContractDocument);
  const blockframesAdmin = _blockframesAdmin.docs.map(d => d.id);
  const offers = _offers.docs.map(d => d.data() as Offer);
  const buckets = _buckets.docs.map(d => d.data() as Bucket);
  const campaigns = _campaigns.docs.map(d => d.data() as Campaign);

  const collectionMap: { name: string, docs: any[], refs: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData> }[] = [
    {
      name: 'notifications',
      docs: notifications,
      refs: _notifications
    },
    {
      name: 'invitations',
      docs: invitations,
      refs: _invitations
    },
    {
      name: 'events',
      docs: events,
      refs: _events
    },
    {
      name: 'movies',
      docs: movies,
      refs: _movies
    },
    {
      name: 'organizations',
      docs: organizations,
      refs: _organizations
    },
    {
      name: 'permissions',
      docs: permissions,
      refs: _permissions
    },
    {
      name: 'contracts',
      docs: contracts,
      refs: _contracts
    },
    {
      name: 'blockframesAdmin',
      docs: blockframesAdmin,
      refs: _blockframesAdmin
    },
    {
      name: 'offers',
      docs: offers,
      refs: _offers
    },
    {
      name: 'buckets',
      docs: buckets,
      refs: _buckets
    },
    {
      name: 'campaigns',
      docs: campaigns,
      refs: _campaigns
    }
  ];


  //////////////////
  // CHECK WHAT CAN BE DELETED
  // We want to keep only the users and orgs related to movies and the ones used in e2e tests (staticUsers) along with the documents in others collections they are linked to
  //////////////////



  const _usersLinkedToMovies = [];
  const _orgsLinkedToMovies = [];

  for (const movie of movies) {
    if (movie._meta.createdBy) {
      _usersLinkedToMovies.push(movie._meta.createdBy);
    }

    if (movie._meta.updatedBy) {
      _usersLinkedToMovies.push(movie._meta.updatedBy);
    }

    if (movie._meta.deletedBy) {
      _usersLinkedToMovies.push(movie._meta.deletedBy);
    }

    for (const orgId of movie.orgIds) {
      _usersLinkedToMovies.push(getOrgSuperAdmin(orgId, permissions));
      _orgsLinkedToMovies.push(orgId);
    }
  }

  const e2eUsers = Object.values(staticUsers).concat(USERS);
  const usersToKeep: string[] = Array.from(new Set(_usersLinkedToMovies.concat(e2eUsers))).filter(uid => _users.docs.find(d => d.id === uid));
  console.log('Users to keep', usersToKeep.length);


  const orgsLinkedToEvents = [];
  for (const event of events) {
    orgsLinkedToEvents.push(event.ownerOrgId);
  }

  const orgsToKeep: string[] = Array.from(new Set(_orgsLinkedToMovies.concat(orgsLinkedToEvents))).filter(id => _organizations.docs.find(d => d.id === id));
  console.log('Orgs to keep', orgsToKeep.length);


  //////////////////
  // FILTER DOCUMENT TO DELETE
  //////////////////

  const usedDocuments: InspectionResult[] = [];
  const _usedDocumentsForUsers = usersToKeep.map(uid => {
    const user = _users.docs.find(d => d.id === uid);
    return inspectUser(user, collectionMap);
  }).reduce((a: InspectionResult[], b: InspectionResult[]) => a.concat(b), []);

  const _usedDocumentsForOgs = orgsToKeep.map(id => {
    const org = _organizations.docs.find(d => d.id === id);
    return inspectOrg(org, collectionMap);
  }).reduce((a: InspectionResult[], b: InspectionResult[]) => a.concat(b), []);

  _usedDocumentsForUsers.forEach(d => {
    if (!usedDocuments.find(u => u.docId === d.docId && u.collection === d.collection)) {
      usedDocuments.push(d);
    }
  });

  _usedDocumentsForOgs.forEach(d => {
    if (!usedDocuments.find(u => u.docId === d.docId && u.collection === d.collection)) {
      usedDocuments.push(d);
    }
  });

  console.log('Used documents to keep : ', usedDocuments.length);

  const documentsToDelete: { collection: string, docId: string }[] = [];
  for (const collection of collectionMap) {

    for (const document of collection.docs) {
      const docId = document.id || document.uid || document;
      if (!usedDocuments.find(u => u.collection === collection.name && u.docId === docId)) {
        documentsToDelete.push({ collection: collection.name, docId });
      }
    }

  }
  console.log('Documents that can be deleted : ', documentsToDelete.length);

  //////////////////
  // ACTUAL DELETION
  //////////////////

  for (const user of _users.docs) {
    if (!usersToKeep.includes(user.id)) {
      await user.ref.delete();
      console.log(`deleted users/${user.id}`);
    }
  }

  for (const document of documentsToDelete) {
    const col = collectionMap.find(c => c.name == document.collection);
    const doc = col.refs.docs.find(d => d.id === document.docId);
    await doc.ref.delete();

    const batch = db.batch();
    await removeAllSubcollections(doc, batch, db);
    await batch.commit();

    console.log(`deleted ${document.collection}/${document.docId}`);
  }

  for (const docIndex of _docsIndex.docs) {
    if (!usedDocuments.some(u => u.docId === docIndex.id)) {
      await docIndex.ref.delete();
      console.log(`deleted docsIndex/${docIndex.id}`);
    }
  }


  //////////////////
  // CLEANING OF REMAINING DOCUMENTS
  //////////////////

  const remainingOrgs = await db.collection('orgs').get();
  for (const _org of remainingOrgs.docs) {
    console.log(`Updating org ${_org.id}`);
    const org = _org.data() as OrganizationDocument;
    org.userIds = org.userIds.filter(uid => usersToKeep.includes(uid));
    await _org.ref.set(org);
  }

  console.log('Cleaned remaining orgs');

  const remainingPermissions = await db.collection('permissions').get();
  for (const _perm of remainingPermissions.docs) {

    console.log(`Updating perm ${_perm.id}`);
    const perm = _perm.data() as PermissionsDocument;

    const currentUsers = Object.keys(perm.roles);

    const roles = {};
    for (const orgUser of currentUsers) {
      if (usersToKeep.includes(orgUser)) {
        roles[orgUser] = perm.roles[orgUser];
      }
    }
    perm.roles = roles;
    await _perm.ref.set(perm);

  }

  console.log('Cleaned remaining permissions');
  console.log(`Ended ! Waiting for emulator to stop and upload of shrinked db to ${latestAnonShrinkedDbDir}`);
}


function getPermissionById(orgId: string, permissions: PermissionsDocument[]) {
  return permissions.find(o => o.id === orgId);
}

function getOrgSuperAdmin(orgId: string, permissions: PermissionsDocument[]) {
  const permission = getPermissionById(orgId, permissions);
  return Object.keys(permission.roles).find(userId => permission.roles[userId] === 'superAdmin')
}


function inspectUser(
  user: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>,
  collections: { name: string, docs: any[] }[],
  verbose = false
) {

  const inspectionResult: InspectionResult[] = [];
  for (const collection of collections) {
    for (const document of collection.docs) {
      if (userMap[collection.name]) {
        for (const attr of userMap[collection.name]) {
          if (isMatchingValue(user.id, document, attr, collection.name)) {
            if (verbose) {
              console.log(`Found User ${user.id} in ${collection.name} document ${document.id || document.uid || document} in attr ${attr || 'documentId'}`);
            }

            inspectionResult.push({ uid: user.id, collection: collection.name, docId: document.id || document.uid || document, attr });
          }
        }
      }
    }
  }

  return inspectionResult;
}

function inspectOrg(
  org: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>,
  collections: { name: string, docs: any[] }[],
  verbose = false
) {

  const inspectionResult: InspectionResult[] = [];
  for (const collection of collections) {
    for (const document of collection.docs) {
      if (orgMap[collection.name]) {
        for (const attr of orgMap[collection.name]) {
          if (isMatchingValue(org.id, document, attr, collection.name)) {
            if (verbose) {
              console.log(`Found Org ${org.id} in ${collection.name} document ${document.id || document.uid || document} in attr ${attr || 'documentId'}`);
            }

            inspectionResult.push({ id: org.id, collection: collection.name, docId: document.id || document.uid || document, attr });
          }
        }
      }
    }
  }

  return inspectionResult;
}


function isMatchingValue(stringToFind: string, document: unknown, attr: string, collectionName: string) {
  if (!stringToFind) return;

  if (['blockframesAdmin', 'buckets'].includes(collectionName) && attr == '') {
    return stringToFind === document;
  }

  const val = getValue(document, attr);

  if (collectionName === 'permissions' && attr === 'roles') {
    return !!val[stringToFind];
  } else if (Array.isArray(val)) {
    return val.some(v => isString(v) ? v === stringToFind : JSON.stringify(v).indexOf(stringToFind));  // for object or string arrays
  } else {
    return val === stringToFind;
  }
}
