import { DbRecord } from '@blockframes/firebase-utils';
import { metaDoc, META_COLLECTION_NAME } from '@blockframes/utils/maintenance';
import { jwplayer } from '@env';
import { anonymizeDocument } from './lib';

//@TODO #5543 unit-test runAnonymization and loadDb 
describe('Test ORG anonymization function', () => {

  it('should anonymize org documents', async () => {
    const id = 'AAAA01';
    const orgRecord: DbRecord = {
      docPath: `orgs/${id}`,
      content: {
        id,
        name: 'org name A',
        email: 'email@foo.org'
      }
    };

    const doc = anonymizeDocument(orgRecord);
    expect(doc.content.id).toEqual(orgRecord.content.id);
    expect(doc.content.email).not.toEqual(orgRecord.content.email);
    expect(doc.content.name).not.toEqual(orgRecord.content.name);
  });
});

describe('Test USERS anonymization function', () => {
  it('should anonymize user documents', async () => {
    const uid = 'AAAA01';
    const userRecord: DbRecord = {
      docPath: `users/${uid}`,
      content: {
        uid,
        email: `${uid}@foo.org`,
        firstName: `Foo`,
        lastName: 'Bar',
        privacyPolicy: {
          ip: '127.0.0.1',
          date: new Date()
        },
        termsAndConditions: {
          festival: {
            ip: '127.0.0.1',
            date: new Date()
          },
          catalog: {
            ip: '127.0.0.1',
            date: new Date()
          },
          financiers: {
            ip: '127.0.0.1',
            date: new Date()
          },
        }
      }
    };

    const doc = anonymizeDocument(userRecord);
    expect(doc.content.uid).toEqual(userRecord.content.uid);
    expect(doc.content.email).not.toEqual(userRecord.content.email);
    expect(doc.content.firstName).not.toEqual(userRecord.content.firstName);
    expect(doc.content.lastName).not.toEqual(userRecord.content.lastName);
    expect(doc.content.privacyPolicy).toBeDefined();
    expect(doc.content.privacyPolicy.ip).not.toEqual(userRecord.content.privacyPolicy.ip);
    expect(doc.content.termsAndConditions.festival.ip).not.toEqual(userRecord.content.termsAndConditions.festival.ip);
    expect(doc.content.termsAndConditions.catalog.ip).not.toEqual(userRecord.content.termsAndConditions.catalog.ip);
    expect(doc.content.termsAndConditions.financiers.ip).not.toEqual(userRecord.content.termsAndConditions.financiers.ip);
  });
});

describe('Test INVITATIONS anonymization function', () => {
  it('should anonymize invitation documents', async () => {
    const id = 'AAAA01';
    const invitationRecord: DbRecord = {
      docPath: `invitations/${id}`,
      content: {
        id,
        type: 'attendEvent',
        mode: 'invitation',
        status: 'pending',
        fromOrg: {
          id: 'orgIdA',
          name: 'org name B',
          email: 'email@foo.org'
        },
        toUser: {
          uid: 'uidA',
          email: 'uidA@foo.org',
          firstName: `Foo`,
          lastName: 'Bar'
        }
      }
    };

    const doc = anonymizeDocument(invitationRecord);

    // Check that ids are not updated
    expect(doc.content.id).toEqual(invitationRecord.content.id);
    expect(doc.content.fromOrg.id).toEqual(invitationRecord.content.fromOrg.id);
    expect(doc.content.toUser.uid).toEqual(invitationRecord.content.toUser.uid);

    // Check that other fields have been anonymized
    expect(doc.content.toUser.email).not.toEqual(invitationRecord.content.toUser.email);
    expect(doc.content.toUser.firstName).not.toEqual(invitationRecord.content.toUser.firstName);
    expect(doc.content.toUser.lastName).not.toEqual(invitationRecord.content.toUser.lastName);
    expect(doc.content.toUser.privacyPolicy).toBeUndefined();
    expect(doc.content.fromOrg.email).not.toEqual(invitationRecord.content.fromOrg.email);
    expect(doc.content.fromOrg.name).not.toEqual(invitationRecord.content.fromOrg.name);
  });
});

describe('Test NOTIFICATIONS anonymization function', () => {
  it('should anonymize notification documents', async () => {
    const id = 'CCCC01';
    const notificationRecord: DbRecord = {
      docPath: `notifications/${id}`,
      content: {
        id,
        toUserId: 'uidA',
        organization: {
          id: 'orgIdB',
          name: 'org name C',
          email: 'email@foo.org'
        },
        user: {
          uid: 'uidC',
          email: 'uidC@foo.org',
          firstName: `Foo`,
          lastName: 'Bar'
        }
      }
    };

    const doc = anonymizeDocument(notificationRecord);

    // Check that ids are not updated
    expect(doc.content.id).toEqual(notificationRecord.content.id);
    expect(doc.content.toUserId).toEqual(notificationRecord.content.toUserId);
    expect(doc.content.organization.id).toEqual(notificationRecord.content.organization.id);
    expect(doc.content.user.uid).toEqual(notificationRecord.content.user.uid);

    // Check that other fields have been anonymized
    expect(doc.content.user.email).not.toEqual(notificationRecord.content.user.email);
    expect(doc.content.user.firstName).not.toEqual(notificationRecord.content.user.firstName);
    expect(doc.content.user.lastName).not.toEqual(notificationRecord.content.user.lastName);
    expect(doc.content.user.privacyPolicy).toBeUndefined();
    expect(doc.content.organization.email).not.toEqual(notificationRecord.content.organization.email);
    expect(doc.content.organization.name).not.toEqual(notificationRecord.content.organization.name);
  });
});

describe('Test MOVIES anonymization function', () => {
  it('should anonymize movie documents', async () => {
    const anonymizedJwplayerId = jwplayer.testVideoId;
    const id = 'MOV01';
    const titleRecord: DbRecord = {
      docPath: `movies/${id}`,
      content: {
        id,
        title: { international: 'title international', original: 'original title' },
        promotional: {
          videos: {
            screener: {
              title: 'test screener',
              jwPlayerId: 'IDjwplayer1'
            },
            publicScreener: {
              title: 'test public screener',
              jwPlayerId: 'IDjwplayer2'
            },
            salesPitch: {
              title: 'test salesPitch',
              jwPlayerId: 'IDjwplayersalesPitch'
            },
            otherVideo: {
              title: 'test otherVideo',
              jwPlayerId: 'IDjwplayerotherVideo'
            }
          }
        }
      }
    }

    const doc = anonymizeDocument(titleRecord);

    expect(doc.content.id).toEqual(titleRecord.content.id);
    expect(doc.content.title.international).toEqual(titleRecord.content.title.international);

    expect(doc.content.promotional.videos.screener.title).toEqual(titleRecord.content.promotional.videos.screener.title);
    expect(doc.content.promotional.videos.screener.jwPlayerId).toEqual(anonymizedJwplayerId);

    expect(doc.content.promotional.videos.publicScreener.title).toEqual(titleRecord.content.promotional.videos.publicScreener.title);
    expect(doc.content.promotional.videos.publicScreener.jwPlayerId).toEqual(anonymizedJwplayerId);

    expect(doc.content.promotional.videos.otherVideo.jwPlayerId).toEqual(anonymizedJwplayerId);

    expect(doc.content.promotional.videos.salesPitch.title).toEqual(titleRecord.content.promotional.videos.salesPitch.title);
    expect(doc.content.promotional.videos.salesPitch.jwPlayerId).toEqual(anonymizedJwplayerId);
  });
});

describe(`Test ${META_COLLECTION_NAME} anonymization function`, () => {
  it('maintenance mode should be set to true', async () => {

    const titleRecord: DbRecord = {
      docPath: metaDoc,
      content: {
        startedAt: '',
        endedAt: new Date()
      }
    };

    const doc = anonymizeDocument(titleRecord);
    expect(doc.content.startedAt.getTime()).toBeDefined();
    expect(doc.content.endedAt).toBe(null)
  });
});
