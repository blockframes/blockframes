import * as firebase from '@firebase/testing';
import fs from 'fs';

const FIRESTORE_RULES_ALLOW_ALL = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
`;

export const setup = async (auth, data) => {
  const projectId = `rules-spec-${Date.now()}`;
  const app = await firebase.initializeTestApp({
    projectId,
    auth
  });

  await firebase.loadFirestoreRules({
    projectId,
    rules: FIRESTORE_RULES_ALLOW_ALL
  });

  const db = app.firestore();

  // Write mock documents before rules
  if (data) {
    const ps = data.map(({ docPath, content }) => db.doc(docPath).set(content));
    await Promise.all(ps);
  }

  // Apply actual rules
  const rules = fs.readFileSync('firestore.rules', 'utf8');

  await firebase.loadFirestoreRules({
    projectId,
    rules
  });

  return db;
};

export const teardown = () => {
  return Promise.all(firebase.apps().map(app => app.delete()));
};

// we define custom matchers to validate firestore rules allow / deny.
// source: https://angularfirebase.com/lessons/testing-firestore-security-rules-with-the-emulator/
//
// the "correct" location for these extensions is `test-setup.ts` but it is not loaded
// correctly at the moment.
// This is a quick and simple way to inject the extension in the test environment:
// this helper file will be included by every test using firestore rules.
expect.extend({
  async toAllow(x) {
    let pass = false;
    try {
      await firebase.assertSucceeds(x);
      pass = true;
    } catch (err) {}

    return {
      pass,
      message: () => 'Expected Firebase operation to be allowed, but it was denied'
    };
  }
});

expect.extend({
  async toDeny(x) {
    let pass = false;
    try {
      await firebase.assertFails(x);
      pass = true;
    } catch (err) {}
    return {
      pass,
      message: () => 'Expected Firebase operation to be denied, but it was allowed'
    };
  }
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toAllow(): CustomMatcherResult;

      toDeny(): CustomMatcherResult;
    }
  }
}

describe('smoke test', () => {
  // This file is a spec file so it's included ONLY during test
  test('smoky', () => {});
});
