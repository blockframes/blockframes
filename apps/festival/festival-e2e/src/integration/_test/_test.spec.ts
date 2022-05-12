/// <reference types="cypress" />

import { examples } from '../../fixtures/_test';

//* TESTS --------------------------------------*//

describe('Testing bridge between Cypress and node', () => {
  before(() => {
    firebase.clear();
  });

  it('creates a single doc', () => {
    firebase.create({ ...examples.singleDoc });
  });

  it('creates multiple docs', () => {
    firebase.create({ ...examples.multipleDocs });
  });

  it('creates multiple docs from an array of data', () => {
    firebase.create({ ...examples.multipleDocsBis });
  });

  it('creates a doc with an array in a field', () => {
    firebase.create({ ...examples.docWithArray });
  });

  it('creates a doc with an object', () => {
    firebase.create({ ...examples.docWithObjet });
  });

  it('creates a doc with a subcollection', () => {
    firebase.create({ ...examples.docWithSubCollection });
  });

  it('retrieves a doc', () => {
    firebase.create({ ...examples.singleDoc });
    const path = Object.keys(examples.singleDoc)[0];
    firebase.get(path).then(data => {
      cy.log('Data retrieved : ', data);
      const retrieved = JSON.stringify(data);
      const example = JSON.stringify(examples.singleDoc[path]);
      expect(example).to.equal(retrieved);
    });
  });

  it('retrieves a collection', () => {
    firebase.create({ ...examples.multipleDocsBis });
    const collection = Object.keys(examples.multipleDocsBis)[0];
    firebase.get(collection).then((data: [] ) => {
      cy.log('Collection retrieved : ', JSON.stringify(data))
      data.forEach(retrieved => {
        const exampleValues = Object.values(examples.multipleDocs);
        const retrievedValues = Object.values(retrieved)[0]
        expect(Object.values(exampleValues)).to.deep.include(retrievedValues)
      })
    });
  });

  //TODO : retrieves an array of documents, an array of collections

  it('deletes a doc', () => {
    firebase.create({ ...examples.docToDelete });
    const path = Object.keys(examples.docToDelete)[0];
    firebase.get(path).then(data => {
      console.log('data : ', data)
      const retrieved = JSON.stringify(data);
      const example = JSON.stringify(examples.docToDelete[path]);
      expect(example).to.equal(retrieved);
    });
    firebase.delete(path);
    firebase.get(path).then(data => expect(data).to.equal('no data'));
  });

  //TODO : delete a collection, an array of documents, an array of collections

  //TODO : update documents
});

//* FUNCTIONS -------------------------------*//

const firebase = {
  clear() {
    this.delete([
      'example-single',
      'example-multiple',
      'example-array',
      'example-object',
      'example-subcollection',
      'example-deletion',
    ]);
  },

  delete(paths: string | string[]) {
    return cy.task('deleteData', paths);
  },

  get(paths: string | string[]) {
    return cy.task('getData', paths);
  },

  create(data: Record<string, object> | Record<string, object[]>) {
    return cy.task('importData', { ...data });
  },

  //TODO : better type
  update(data: any | any[]) {
    return cy.task('updateData', { ...data });
  },
};
