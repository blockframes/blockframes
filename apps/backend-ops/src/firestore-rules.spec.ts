import firebase from '@firebase/rules-unit-testing';
import { initFunctionsTestMock, setFirestoreDB } from '@blockframes/testing/firebase/functions';

expect.extend({
  async toAllow(testPromise) {
    let err = '';
    let pass = false;
    try {
      await firebase.assertSucceeds(testPromise);
      pass = true;
    } catch (error) {
      err = error;
      // log error to see which rules caused the test to fail
      console.log(err);
    }

    return {
      pass,
      message: () =>
        `Expected Op to be allowed, but was denied ${err ? '\nErr: err': ''}`
    };
  }
});

expect.extend({
  async toDeny(testPromise) {
    let err = '';
    let pass = false;
    try {
      await firebase.assertFails(testPromise);
      pass = true;
    } catch (error) {
      // log error to see which rules caused the test to fail
      err = error;
      console.log(err);
    }

    return {
      pass,
      message: () =>
        `Expected Op to be denied, but was allowed ${err ? '\nErr: err': ''}`
    };
  }
});

afterAll(() => {
  firebase.apps().forEach(app => app.delete());
});

describe('Campaign Rules', () => {

  beforeAll(async () => {
    initFunctionsTestMock();

  });



});
