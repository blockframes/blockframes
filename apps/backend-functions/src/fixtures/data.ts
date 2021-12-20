import { metaDoc } from '@blockframes/utils/maintenance';

export const testFixture = {
  //Meta
  '_META/_MAINTENANCE': {
    startedAt: null,
    endedAt: null
  },

  '_META/_VERSION': {
    currentVersion: 69
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
    email: 'u2@cascade8.com',
    uid: 'uid-user2',
    orgId: 'O001',
  },
};


//Meta collection, for maintenance control.
// testFixture[metaDoc] = {};
// testFixture[metaDoc].endedAt = true;
