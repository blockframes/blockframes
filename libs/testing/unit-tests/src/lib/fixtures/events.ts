import { metaDoc } from "@blockframes/utils/maintenance";

const fixtures = {
  // Meta
  [metaDoc]: {
    startedAt: new Date(),
    endedAt: null
  },

  // Invitations
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

  // Notification
  'notifications/NOO1': {
    id: 'NOO1',
    docId: 'E001'
  }
};


const oneHour = 3600 * 1000;
const oneDay = 24 * oneHour;

const users = [{ uid: 'U001' }, { uid: 'U002' }, { uid: 'U003' }];

const events = [
  { id: 'E001', start: new Date(Date.now() + oneDay + (oneHour / 2)) }, // Should create a notification
  { id: 'E002', start: new Date(Date.now() + oneDay + oneDay) }, // Should not create a notification
  { id: 'E003', start: new Date(Date.now() - oneDay) }, // Should not create a notification
];

const invitations = [
  {
    id: 'I001',
    eventId: 'E001',
    toUser: {
      uid: 'U001'
    },
    status: 'accepted'
  },
  {
    id: 'I002',
    eventId: 'E001',
    toUser: {
      uid: 'U002'
    },
    status: 'pending'
  },
  {
    id: 'I003',
    eventId: 'E002',
    toUser: {
      uid: 'U003'
    },
    status: 'accepted'
  },
  {
    id: 'I004',
    eventId: 'E003',
    toUser: {
      uid: 'U003'
    },
    status: 'accepted'
  },
  {
    id: 'I005',
    eventId: 'E001',
    fromUser: {
      uid: 'U003'
    },
    mode: 'request',
    status: 'accepted'
  }
];

export { users, events, invitations, fixtures };
