import { metaDoc } from "@blockframes/utils/maintenance";

export const invitationsFixtures = {
  // Meta
  [metaDoc]: {
    startedAt: new Date(),
    endedAt: null
  },

  // Users
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

  // Invitations
  'invitations/I001': {
    id: 'I001',
    type: 'joinOrganization',
  },
  'invitations/I002': {
    id: 'I002',
    type: 'attendEvent',
    mode: 'request',
    eventId: 'E001'
  },
  'invitations/I003': {
    id: 'I003',
    eventId: 'E001',
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

};