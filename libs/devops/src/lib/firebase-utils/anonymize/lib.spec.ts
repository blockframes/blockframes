import { testVideoId } from '@env';
import { DbRecord } from '../util';
import { anonymizeDocument } from './lib';

//@TODO #5543 unit-test runAnonymization and loadDb 
describe('Test ORG anonymization function', () => {

  it('should anonymize org documents', async () => {
    const id = 'AAAA01';
    const orgRecord: DbRecord = {
      docPath: `orgs/${id}`,
      content: {
        id,
        denomination: { full: 'org full name A', public: 'org public name A' },
        email: 'email@foo.org',
        fiscalNumber: 'FR 123 456 78 452'
      }
    };

    const doc = anonymizeDocument(orgRecord);
    expect(doc.content.id).toEqual(orgRecord.content.id);
    expect(doc.content.email).not.toEqual(orgRecord.content.email);
    expect(doc.content.fiscalNumber).not.toEqual(orgRecord.content.fiscalNumber);
  });

  it('should not anonymise fiscalNumber if not present in original doc', async () => {
    const id = 'BBBB01';
    const orgRecord: DbRecord = {
      docPath: `orgs/${id}`,
      content: {
        id,
        denomination: { full: 'org full name B', public: 'org public name B' },
        email: 'email@bar.org',
      }
    };

    const doc = anonymizeDocument(orgRecord);
    expect(doc.content.id).toEqual(orgRecord.content.id);
    expect(doc.content.email).not.toEqual(orgRecord.content.email);
    expect(doc.content.fiscalNumber).toBeUndefined();
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
          ip: '127.0.0.1'
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
          denomination: { full: 'org full name A', public: 'org public name A' },
          email: 'email@foo.org',
          fiscalNumber: 'FR 123 456 78 452'
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
    expect(doc.content.fromOrg.fiscalNumber).not.toEqual(invitationRecord.content.fromOrg.fiscalNumber);
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
          denomination: { full: 'org full name C', public: 'org public name C' },
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
    expect(doc.content.organization.fiscalNumber).toBeUndefined();
  });
});

describe('Test MOVIES anonymization function', () => {
  it('should anonymize movie documents', async () => {
    const anonymizedJwplayerId = testVideoId;
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
            salesPitch: {
              title: 'test salesPitch',
              jwPlayerId: 'IDjwplayersalesPitch'
            },
            otherVideos: [
              {
                title: 'test otherVideos1',
                jwPlayerId: 'IDjwplayerotherVideos1'
              },
              {
                title: 'test otherVideos2',
                jwPlayerId: 'IDjwplayerotherVideos2'
              }
            ]
          }
        }
      }
    }

    const doc = anonymizeDocument(titleRecord);

    expect(doc.content.id).toEqual(titleRecord.content.id);
    expect(doc.content.title.international).toEqual(titleRecord.content.title.international);

    expect(doc.content.promotional.videos.screener.title).toEqual(titleRecord.content.promotional.videos.screener.title);
    expect(doc.content.promotional.videos.screener.jwPlayerId).toEqual(anonymizedJwplayerId);

    doc.content.promotional.videos.otherVideos.map(o => expect(o.jwPlayerId).toEqual(anonymizedJwplayerId));

    expect(doc.content.promotional.videos.salesPitch.title).toEqual(titleRecord.content.promotional.videos.salesPitch.title);
    expect(doc.content.promotional.videos.salesPitch.jwPlayerId).toEqual(anonymizedJwplayerId);
  });
});

describe('Test _META anonymization function', () => {
  it('maintenance mode should be set to true', async () => {

    const id = '_MAINTENANCE';
    const titleRecord: DbRecord = {
      docPath: `_META/${id}`,
      content: {
        startedAt: '',
        endedAt: new Date()
      }
    };

    const doc = anonymizeDocument(titleRecord);
    expect(doc.content.startedAt.seconds).toBeDefined();
    expect(doc.content.endedAt).toBe(null)
  });
});
