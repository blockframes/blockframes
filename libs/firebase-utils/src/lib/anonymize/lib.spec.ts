import { DbRecord } from '../util';
import { anonymizeDocument } from './lib'

describe('Test anonymization functions', () => {

  it('should anonymize org documents', async () => {
    const idA = 'AAAA01';
    const orgRecordA: DbRecord = {
      docPath: `orgs/${idA}`,
      content: {
        id: idA,
        denomination: { full: 'org full name A', public: 'org public name A' },
        email: 'email@foo.org',
        fiscalNumber: 'FR 123 456 78 452'
      }
    }
    const docA = anonymizeDocument(orgRecordA);
    expect(docA.content.id).toEqual(orgRecordA.content.id);
    expect(docA.content.email).not.toEqual(orgRecordA.content.email);
    expect(docA.content.fiscalNumber).not.toEqual(orgRecordA.content.fiscalNumber);

    const idB = 'BBBB01';
    const orgRecordB: DbRecord = {
      docPath: `orgs/${idA}`,
      content: {
        id: idB,
        denomination: { full: 'org full name B', public: 'org public name B' },
        email: 'email@bar.org',
      }
    }
    const docB = anonymizeDocument(orgRecordB);
    expect(docB.content.id).toEqual(orgRecordB.content.id);
    expect(docB.content.email).not.toEqual(orgRecordB.content.email);
    expect(docB.content.fiscalNumber).toBeUndefined();
  });

  it('should anonymize user documents', async () => {
    const uidA = 'AAAA01';
    const userRecordA: DbRecord = {
      docPath: `users/${uidA}`,
      content: {
        uid: uidA,
        email: `${uidA}@foo.org`,
        firstName: `Foo`,
        lastName: 'Bar',
        privacyPolicy: {
          ip: '127.0.0.1'
        },
        watermark: {}
      }
    }

    const docA = anonymizeDocument(userRecordA);
    expect(docA.content.uid).toEqual(userRecordA.content.uid);
    expect(docA.content.email).not.toEqual(userRecordA.content.email);
    expect(docA.content.firstName).not.toEqual(userRecordA.content.firstName);
    expect(docA.content.lastName).not.toEqual(userRecordA.content.lastName);
    expect(docA.content.privacyPolicy.ip).not.toEqual(userRecordA.content.privacyPolicy.ip);
  });
});
