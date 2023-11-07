﻿import { metaDoc } from '@blockframes/utils/maintenance';

export const rulesFixtures = {
  // Docs Index
  'docsIndex/DP03': {

  },

  // Permissions
  'permissions/O001': {
    roles: {
      'uid-admin': 'admin',
      'uid-user2': 'member',
      'uid-sAdmin': 'superAdmin',
    },
    id: 'O001',
  },
  'permissions/O002': {
    roles: {
      'uid-user3': 'member',
    },
    id: 'O002',
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

  // Orgs
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

  // Users
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

  // Blockframes Admin
  'blockframesAdmin/uid-bfAdmin': {},

  // Movies
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
        acceptedAt: null,
        submittedAt: null,
      },
      festival: {
        status: 'accepted',
        access: true,
        refusedAt: null,
        acceptedAt: null,
        submittedAt: null,
      },
      financiers: {
        status: 'draft',
        access: false,
        refusedAt: null,
        acceptedAt: null,
        submittedAt: null,
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
        acceptedAt: null,
        submittedAt: null,
      },
      festival: {
        status: 'accepted',
        access: true,
        refusedAt: null,
        acceptedAt: null,
        submittedAt: null,
      },
      financiers: {
        status: 'accepted',
        access: true,
        refusedAt: null,
        acceptedAt: null,
        submittedAt: null,
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
        acceptedAt: null,
        submittedAt: null,
      },
      festival: {
        status: 'draft',
        access: true,
        refusedAt: null,
        acceptedAt: null,
        submittedAt: null,
      },
      financiers: {
        status: 'draft',
        access: false,
        refusedAt: null,
        acceptedAt: null,
        submittedAt: null,
      }
    },
    note: '',
    orgIds: ['O001']
  },
  'movies/WF-001': {
    id: 'WF-001',
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

  'events/E003': {
    id: 'E002',
    type: 'meeting',
    start: new Date(),
    end: new Date(),
    meta: { organizerUid: 'uidUserTest', attendees: { 'uid-foo': { status: 'requesting' } } },
    ownerOrgId: 'O001',
    accessibility: 'private'
  },

  // Notifications
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

  // Campaigns
  'campaigns/M001': {
    id: 'M001',
    orgId: 'O001',
  },
  'campaigns/MI-077': {
    id: 'MI-077',
    orgId: 'MI-UK',
  },

  // Invitations
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

  // Contracts
  'contracts/C001': {
    id: 'C001',
    stakeholders: ['O001'],
  },
  'contracts/C002': {
    id: 'C002',
    stakeholders: []
  },
  'contracts/W001': {
    id: 'W001',
    buyerId: 'O001',
  },
  'contracts/W002': {
    id: 'W002',
    sellerId: 'O001',
  },

  // Terms
  'terms/T00X': {
    id: 'T00X',
    contractId: 'XXX'
  },
  'terms/T003': {
    id: 'T003',
    contractId: 'W001'
  },
  'terms/T004': {
    id: 'T004',
    contractId: 'W002'
  },

  // Incomes
  'incomes/I00X': {
    id: 'I00X',
    contractId: 'W001'
  },
  'incomes/I001': {
    id: 'I001',
    titleId: 'MI-0d7',
    contractId: 'D002'
  },
  'incomes/I002': {
    id: 'I002',
    titleId: 'MI-0d7',
    contractId: 'D003'
  },
  'incomes/I013': {
    id: 'I013',
    contractId: 'W002'
  },
  'incomes/I016': {
    id: 'I016',
    contractId: 'C001'
  },

  // Consents
  'consents/O001': {
    id: 'O001',
    access: [],
    share: []
  },

  // Waterfall
  'waterfall/MI-0d7': {
    id: 'MI-0d7',
    orgIds: ['O002']
  },
  'waterfall/MI-077': {
    id: 'MI-077',
    orgIds: ['O002']
  },
  'waterfall/WF-001': {
    id: 'WF-001',
    orgIds: ['O001']
  },
  'waterfall/MI-0d7/blocks/B001': {
    id: 'B001',
  },
  'waterfall/WF-001/blocks/B001': {
    id: 'B001',
  },
  'waterfall/MI-0d7/permissions/O002': {
    id: 'O002',
    isAdmin: false
  },
  'waterfall/WF-001/permissions/O001': {
    id: 'O001',
    isAdmin: true,
  },
  'waterfall/WF-001/permissions/foo': {
    id: 'foo',
    isAdmin: false
  },
  'waterfall/MI-0d7/permissions/O003': {
    id: 'O003',
    isAdmin: false
  },
  'waterfall/M001/documents/D001': {
    id: 'D001'
  },
  'waterfall/WF-001/documents/D001': {
    id: 'D001'
  },
  'waterfall/MI-0d7/documents/D001': {
    id: 'D001'
  },
  'waterfall/MI-0d7/documents/D003': {
    id: 'D003',
  },
  'waterfall/M001/statements/S001': {
    id: 'S001',
  },
  'waterfall/MI-0d7/statements/S001': {
    id: 'S001',
    rightholderId: 'O003'
  },
  'waterfall/MI-0d7/statements/S002': {
    id: 'S002',
    rightholderId: 'O002'
  },
  'waterfall/WF-001/statements/S001': {
    id: 'S001',
    rightholderId: 'O003'
  },
  'waterfall/WF-001/statements/S002': {
    id: 'S002',
    rightholderId: 'O002'
  },
  'waterfall/M001/rights/R001': {
    id: 'R001',
  },
  'waterfall/MI-0d7/rights/R001': {
    id: 'R001',
  },
  'waterfall/WF-001/rights/R001': {
    id: 'R001',
  },
  'expenses/E001': {
    id: 'E001',
    titleId: 'MI-0d7',
    contractId: 'D002'
  },
  'expenses/E002': {
    id: 'E002',
    titleId: 'MI-0d7',
    contractId: 'D003'
  },

};


//Meta collection, for maintenance control.
rulesFixtures[metaDoc] = {};
rulesFixtures[metaDoc].endedAt = true;
