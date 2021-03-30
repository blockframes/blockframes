﻿import { metaDoc } from '@blockframes/utils/maintenance';

export const testFixture = {
  //Permissions
  'permissions/O001': {
    roles: {
      'uid-admin': 'admin',
      'uid-user2': 'member',
      'uid-sAdmin': 'superAdmin',
    },
    id: 'O001',
  },

  'permissions/O001/documentPermissions/D001': {
    ownerId: 'O001',
  },
  'permissions/O001/documentPermissions/MI-000': {
    canCreate: false,
  },
  'permissions/O001/documentPermissions/MI-007': {
    canCreate: true,
    canDelete: true,
    canUpdate: true,
    ownerId: 'O001',
  },
  'permissions/O001/documentPermissions/MI-0d7': {
    canDelete: true,
    canUpdate: true,
    ownerId: 'O001',
  },
  'permissions/O001/documentPermissions/MI-077': {
    canUpdate: true,
    canCreate: true,
    ownerId: 'O001',
  },
  'permissions/O001/documentPermissions/C001': {
    canCreate: true,
  },

  //Orgs
  'orgs/O001': {
    status: 'accepted', //belongs to O001
  },
  'orgs/O002': {
    status: 'accepted'
  },
  'orgs/O003': {
    userIds: ['uid-user3'],
    status: 'pending'
  },

  //Users Collection
  'users/uid-bfAdmin': {
    email: 'bfadmin@cascade8.com',
    uid: 'uid-bfAdmin',
  },
  'users/uid-sAdmin': {
    email: 'admin@cascade8.com',
    uid: 'uid-sAdmin',
    orgId: 'O001',
  },
  'users/uid-admin': {
    email: 'admin@cascade8.com',
    uid: 'uid-admin',
    orgId: 'O001',
  },
  'users/uid-c8': {
    email: 'c8@cascade8.com',
    uid: 'uid-c8',
  },
  'users/uid-user2': {
    email: 'u2@cascade8.com',
    uid: 'uid-user2',
    orgId: 'O001',
  },
  'users/uid-peeptom': {
    email: 'tom@no-org.com',
    uid: 'uid-peeptom',
  },
  'users/uid-user3': {
    email: 'u3@cascade8.com',
    uid: 'uid-user3',
    orgId: 'O002'
  },

  //Blockframes Admin
  'blockframesAdmin/uid-bfAdmin': {},

  //Movies
  'movies/M001': {
    id: 'M001',
    title: {
      original: 'UnitTest',
    },
    storeConfig: {
      appAccess: { festival: true },
      status: 'accepted'
    },
    orgIds: ['O001']
  },
  'movies/MI-0d7': {
    id: 'MI-0d7',
    title: {
      original: 'UnitTest Eraser',
    },
    storeConfig: {
      appAccess: { festival: true },
      status: 'accepted'
    },
    orgIds: ['O001']
  },
  'movies/MI-077': {
    id: 'MI-077',
    title: {
      original: 'UnitTest',
    },
    storeConfig: {
      appAccess: { festival: true },
      status: 'draft',
    },
    note: '',
    orgIds: ['O001']
  },


  // Events
  'events/E001': {
    id: 'E001',
  },

  //Notifications
  'notifications/001': {
    id: '001',
    _meta: { createdAt: Date.now() },
    toUserId: 'uid-c8',
    type: 'invitationToAttendEventUpdated',
    docId: '100',
    user: { uid: 'uid-user2' },
    organization: { id: 'O001' },
    movies: [{ id: 'M001' }],
  },

  //Campaigns
  'campaigns/M001': {
    id: 'M001',
    orgId: 'O001',
  },
  'campaigns/MI-077': {
    id: 'MI-077',
    orgId: 'MI-UK',
  },

  //Invitations
  'invitations/I001': {
    type: 'attendEvent',
    toUser: { uid: 'uid-user2' },
  },
  'invitations/I010': {
    type: 'cancelEvent',
  },
  'invitations/I011' : {
    type: 'cancelEvent',
    fromOrg: { id: 'O011' },
    fromUser: { uid: 'uid-user2' },
  },
  'invitations/I012': {
    type: 'cancelEvent',
    fromOrg: { id: 'O001' },
    fromUser: { uid: 'uid-user2' },
  },

  //Contracts
  'contracts/C001': {
    id: 'C001',
    stakeholders: ['O001'],
  },
  'contracts/C002': {
    id: 'C002',
    stakeholders: []
  },

  //Public Contracts
  'publicContracts/PC01': {
    id: 'PC01',
  },
  // Consents
  'consents/O001': {
    id: 'O001',
    access: [],
    share: []
  },
};


//Meta collection, for maintenance control.
testFixture[metaDoc] = {};
testFixture[metaDoc].endedAt = true;
