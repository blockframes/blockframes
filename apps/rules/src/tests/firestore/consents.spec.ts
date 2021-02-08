import {
  apps,
  assertFails,
  assertSucceeds
} from '@firebase/rules-unit-testing';
import { testFixture } from './fixtures/data';
import { Firestore, initFirestoreApp } from '@blockframes/testing/firebase/functions';
import { Consents } from '@blockframes/consents/+state/consents.firestore';

describe('Consents Rules Tests', () => {
  const projectId = `consentrules-spec-${Date.now()}`;
  let db: Firestore;

  describe('Any user', () => {
    const newConsentId = 'CI-007';
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    describe('Read Consent', () => {
      test('should not be able to read consent collection', async () => {
        const consentRef = db.doc('consents/O001');
        await assertSucceeds(consentRef.get());
      });
    });

    describe('Create Consent', () => {
      test('should not be able to write consent collection', async () => {
        const consentRef = db.doc(`consents/${newConsentId}`);
        const createdConsent: Partial<Consents<Date>> = {
          id: newConsentId,
          access: [],
          share: []
        };
        await assertFails(consentRef.set(createdConsent));
      });

    });



  });


});
