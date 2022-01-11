import { metaDoc } from "@blockframes/utils/maintenance";

export const consentFixtures = {
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

};