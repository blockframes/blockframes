import { metaDoc } from "@blockframes/utils/maintenance";

export const testFixture = {
  //Meta
  [metaDoc]: {
    startedAt: new Date(),
    endedAt: null
  },

  //Orgs
  'orgs/O001': {
    id: 'O001',
    status: 'accepted',
    userIds: ['uid-user2'],
  },

  'users/uid-c8': {
    email: 'c8@cascade8.com',
    uid: 'uid-c8'
  },
  'users/uid-user2': {
    firstName: 'User',
    lastName: 'Two',
    email: 'u2@cascade8.com',
    uid: 'uid-user2',
    orgId: 'O001',
  },

  //Invitations
  'invitations/I001': {
    id: 'I001',
    type: 'joinOrganization',
  },
  'invitations/I002': {
    id: 'I002',
    type: 'attendEvent',
    mode: 'request'
  },
  'invitations/I003': {
    id: 'I003',
    type: 'attendEvent',
    mode: 'invitation',
    fromOrg: {
      denomination: {
        full: 'Unit Test',
        public: 'Unit Test'
      },
      id: 'O001'
    },
    toUser: {
      email: 'test@cascade8.com'
    },
    status: 'pending'
  },

  //Permission
  'permissions/O001': {
    authorOrgId: 'O001',
    orgs: { a: 'O1', b: 'O2' }
  },

  'permissions/O001/documentPermissions/D001': {
    id: 'D001',
    ownerId: 'O001',
  },
};