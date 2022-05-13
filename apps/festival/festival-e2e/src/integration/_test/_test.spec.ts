/// <reference types="cypress" />

import { examples } from '../../fixtures/_test';

//* TESTS --------------------------------------*//

describe('Testing bridge between Cypress and node', () => {
  beforeEach(() => {
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

  it('retrieves a document', () => {
    firebase.create({ ...examples.singleDoc });
    const path = Object.keys(examples.singleDoc)[0];
    firebase.get(path).then(data => {
      cy.log('Data retrieved : ', data);
      expect(data).to.deep.equal(examples.singleDoc[path]);
    });
  });

  it('retrieves a collection', () => {
    firebase.create({ ...examples.multipleDocsBis });
    const collection = Object.keys(examples.multipleDocsBis)[0];
    firebase.get(collection).then((data: []) => {
      cy.log('Collection retrieved : ', JSON.stringify(data));
      data.forEach(retrieved => {
        const exampleValues = Object.values(examples.multipleDocs);
        const retrievedValues = Object.values(retrieved)[0];
        expect(Object.values(exampleValues)).to.deep.include(retrievedValues);
      });
    });
  });

  it('retrieves an array of documents', () => {
    const paths = Object.keys(examples.multipleDocs);
    firebase.create({ ...examples.multipleDocs });
    firebase.get(paths).then((data: []) => {
      cy.log('Array of docs retrieved : ', JSON.stringify(data));
      data.forEach(retrieved => {
        const exampleValues = Object.values(examples.multipleDocs);
        expect(Object.values(exampleValues)).to.deep.include(retrieved);
      });
    });
  });

  it('retrieves an array of collections', () => {
    const collectionPath1 = Object.keys(examples.multipleDocsBis)[0];
    const collectionPath2 = Object.keys(examples.multipleDocsTer)[0];
    firebase.create({ ...examples.multipleDocsBis, ...examples.multipleDocsTer });
    firebase.get([collectionPath1, collectionPath2]).then((data: []) => {
      cy.log('Array of collections retrieved : ', JSON.stringify(data));
      data.forEach((retrieved: []) => {
        retrieved.forEach(doc => {
          const exampleValues = Object.values({ ...examples.multipleDocsBis, ...examples.multipleDocsTer }).flat();
          const docValues = Object.values(doc)[0];
          expect(exampleValues).to.deep.include(docValues);
        });
      });
    });
  });

  it('deletes a doc', () => {
    firebase.create({ ...examples.docToDelete });
    const path = Object.keys(examples.docToDelete)[0];
    firebase.get(path).then(data => {
      console.log('data : ', data);
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
      'example-multiple2',
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
