﻿import { assertFails } from '@firebase/rules-unit-testing';
import { Firestore, initFirestoreApp, rulesFixtures as testFixture } from '@blockframes/testing/unit-tests';
import { Consents } from '@blockframes/model';
import { deleteApp, getApps } from 'firebase/app';

describe('Consents Rules Tests', () => {
  const projectId = `consentrules-spec-${Date.now()}`;
  let db: Firestore;

  describe('Any user', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, 'uid-user2', { firebase: { sign_in_provider: 'password' } });
    });

    afterAll(() => Promise.all(getApps().map((app) => deleteApp(app))));

    test('should not be able to read consent collection', async () => {
      const consentRef = db.doc('consents/O001');
      await assertFails(consentRef.get());
    });

    test('should not be able to write consent collection', async () => {
      const newConsentId = 'CI-007';
      const consentRef = db.doc(`consents/${newConsentId}`);
      const createdConsent: Partial<Consents> = {
        id: newConsentId,
        access: [],
        share: [],
      };
      await assertFails(consentRef.set(createdConsent));
    });
  });

  describe('With User not in org', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, 'uid-consent', { firebase: { sign_in_provider: 'password' } });
    });

    afterAll(() => Promise.all(getApps().map((app) => deleteApp(app))));

    test("user without valid org shouldn't be able to read consent", async () => {
      const consentRef = db.doc('consents/O001');
      await assertFails(consentRef.get());
    });

    test("user without valid org shouldn't be able to create consent", async () => {
      const consentRef = db.doc('consents/C007');
      const consentDetails = { id: 'C007' };
      await assertFails(consentRef.set(consentDetails));
    });

    test("user without valid org shouldn't be able to update consent", async () => {
      const consentRef = db.doc('consents/O001');
      const consentDetails = { notes: 'Unit Test' };
      await assertFails(consentRef.update(consentDetails));
    });

    test("user without valid org shouldn't be able to delete consent", async () => {
      const eventRef = db.doc('consents/O001');
      await assertFails(eventRef.delete());
    });
  });
});
