import { metaDoc } from '@blockframes/utils/maintenance';

export const testFixture = {
  //Docs Index
  'docsIndex/DP03': {

  },

  //Permissions
  'permissions/O001': {
    roles: {
      'uid-admin': 'admin',
      'uid-user2': 'member',
      'uid-sAdmin': 'superAdmin',
    },
    id: 'O001',
  },

  'permissions/O003': {
    id: 'O003',
  },

  'permissions/O004': {
    roles: {
      'uid-admin4': 'admin',
    },
    id: 'O004',
  },
  'permissions/O005': {
    roles: {
      'uid-user5': 'member',
    },
    id: 'O005',
  },
  'permissions/O006': {
    roles: {
      'uid-admin6': 'admin',
    },
    id: 'O006',
  },


  'permissions/O001/documentPermissions/D001': {
    id: 'D001',
    ownerId: 'O001',
  },
  'permissions/O001/documentPermissions/MI-000': {
    id: 'MI-000',
    canCreate: false,
  },
  'permissions/O001/documentPermissions/MI-007': {
    id: 'MI-007',
    canCreate: true,
    canDelete: true,
    canUpdate: true,
    ownerId: 'O001',
  },
  'permissions/O001/documentPermissions/MI-0d7': {
    id: 'MI-0d7',
    canDelete: true,
    canUpdate: true,
    ownerId: 'O001',
  },
  'permissions/O001/documentPermissions/MI-077': {
    id: 'MI-077',
    canUpdate: true,
    canCreate: true,
    ownerId: 'O001',
  },
  'permissions/O001/documentPermissions/C001': {
    id: 'C001',
    canCreate: true,
  },
  'permissions/O003/documentPermissions/C003': {
    id: 'C003',
    canCreate: true,
  },

  //Orgs
  'orgs/O001': {
    id: 'O001',
    status: 'accepted',
    userIds: ['uid-admin', 'uid-sAdmin', 'uid-user2'],
  },
  'orgs/O002': {
    status: 'accepted',
    userIds: ['uid-user3'],
  },
  'orgs/O003': {
    id: 'O003',
    userIds: ['uid-c8'],
  },
  'orgs/O004': {
    id: 'O004',
    userIds: ['uid-admin4']
  },
  'orgs/O005': {
    id: 'O005',
    userIds: ['uid-user5'],
  },
  'orgs/O006': {
    id: 'O006',
    userIds: ['uid-admin6'],
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
  'users/uid-admin4': {
    email: 'admin4@cascade8.com',
    uid: 'uid-admin4',
    orgId: 'O004',
  },
  'users/uid-admin6': {
    email: 'admin6@cascade8.com',
    uid: 'uid-admin6',
    orgId: 'O006',
  },
  'users/uid-c8': {
    email: 'c8@cascade8.com',
    uid: 'uid-c8',
    orgId: 'O003'
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
  'users/uid-user4': {
    email: 'u4@cascade8.com',
    uid: 'uid-user4',
  },
  'users/uid-user5': {
    email: 'u5@cascade8.com',
    uid: 'uid-user5',
    orgId: 'O005'
  },

  //Blockframes Admin
  'blockframesAdmin/uid-bfAdmin': {},

  //Movies
  'movies/M001': {
    id: 'M001',
    title: {
      original: 'UnitTest',
    },
    app: {
      catalog: {
        status: 'draft',
        access: false,
        refusedAt: null,
        acceptedAt: null
      },
      festival: {
        status: 'accepted',
        access: true,
        refusedAt: null,
        acceptedAt: null
      },
      financiers: {
        status: 'draft',
        access: false,
        refusedAt: null,
        acceptedAt: null
      }
    },
    orgIds: ['O001']
  },
  'movies/MI-0d7': {
    id: 'MI-0d7',
    title: {
      original: 'UnitTest Eraser',
    },
    app: {
      catalog: {
        status: 'draft',
        access: false,
        refusedAt: null,
        acceptedAt: null
      },
      festival: {
        status: 'accepted',
        access: true,
        refusedAt: null,
        acceptedAt: null
      },
      financiers: {
        status: 'draft',
        access: true,
        refusedAt: null,
        acceptedAt: null
      }
    },
    orgIds: ['O001']
  },
  'movies/MI-077': {
    id: 'MI-077',
    title: {
      original: 'UnitTest',
    },
    app: {
      catalog: {
        status: 'draft',
        access: false,
        refusedAt: null,
        acceptedAt: null
      },
      festival: {
        status: 'draft',
        access: true,
        refusedAt: null,
        acceptedAt: null
      },
      financiers: {
        status: 'draft',
        access: false,
        refusedAt: null,
        acceptedAt: null
      }
    },
    note: '',
    orgIds: ['O001']
  },


  // Events
  'events/E001': {
    id: 'E001',
  },

  'events/E002': {
    id: 'E002',
    ownerOrgId: 'foo',
    accessibility: 'private'
  },

  'events/E003-public': {
    id: 'E003-public',
    ownerOrgId: 'O001',
    accessibility: 'public',
    title: 'My public screening event',
    type: 'screening',
    meta: {
      titleId: 'MI-0d7'
    }
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
  'invitations/I011': {
    type: 'cancelEvent',
    fromOrg: { id: 'O011' },
    fromUser: { uid: 'uid-user2' },
  },
  'invitations/I012': {
    type: 'cancelEvent',
    fromOrg: { id: 'O001' },
    fromUser: { uid: 'uid-user2' },
  },
  'invitations/I013': {
    type: 'attendEvent',
    eventId: 'E003-public'
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
