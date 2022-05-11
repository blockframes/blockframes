/// <reference types="cypress" />

import { examples } from '../../fixtures/_test';

//* TESTS --------------------------------------*//

describe('Testing bridge between Cypress and noe', () => {
  before(() => {
    firebase.cleanDatabase();
  });

  it('creates a single doc', () => {
    firebase.importData({ ...examples.singleDoc });
  });

  it('creates multiple docs', () => {
    firebase.importData({ ...examples.multipleDocs });
  });

  it('creates a doc with an array in a field', () => {
    firebase.importData({ ...examples.docWithArray });
  });

  it('creates a doc with an object', () => {
    firebase.importData({ ...examples.docWithObjet });
  });

  it('creates a doc with a subcollection', () => {
    firebase.importData({ ...examples.docWithSubCollection });
  });
});

//* FUNCTIONS -------------------------------*//

const firebase = {
  cleanDatabase() {
    firebase.deleteData('example-single');
    firebase.deleteData('example-multiple');
    firebase.deleteData('example-array');
    firebase.deleteData('example-object');
    firebase.deleteData('example-subcollection');
  },

  deleteData(path: string) {
    cy.task('deleteData', path);
  },

  importData(data: any | any[]) {
    cy.task('importData', { ...data });
  },
};
