import { metaDoc } from '@blockframes/utils/maintenance';

export const testFixture = {
  //Permissions
  'permissions/O001': {
    roles: {
      'uid-admin': 'admin',
      'uid-user2': 'member',
      'uid-sAdmin': 'superAdmin',
    },
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

  //Orgs
  'orgs/O001': {
    status: 'accepted', //belongs to O001
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
    ownerId: 'O001',
  },
  'users/uid-peeptom': {
    email: 'tom@no-org.com',
    uid: 'uid-peeptom',
  },

  //Blockframes Admin
  'blockframesAdmin/uid-bfAdmin': {},

  //Movies
  'movies/M001': {
    id: 'M001',
    title: {
      original: 'UnitTest',
    },
    'distributionRights/DR001': {
      id: 'DR001',
    },
  },
  'movies/MI-0d7': {
    id: 'MI-0d7',
    title: {
      original: 'UnitTest Eraser',
    },
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
  },

  'events/E001': {
    id: 'E001',
  },

  //Notifications
  'notifications/001': {
    id: '001',
    date: Date.now(),
    toUserId: 'uid-c8',
    type: 'invitationToAttendEventAccepted',
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
  'invitations/I001' : {
    type: 'attendEvent'
  },
  'invitations/I011' : {
    type: 'cancelEvent'
  },  
};


//Meta collection, for maintenance control.
testFixture[metaDoc] = {};
testFixture[metaDoc].endedAt = true;