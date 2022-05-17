/// <reference types="cypress" />

import { examples } from '../../fixtures/_test';

//* TESTS --------------------------------------*//

describe('Testing bridge between Cypress and node', () => {
  beforeEach(() => {
    firebase.clear();
  });

  it('creates a single doc', () => {
    firebase.create([examples.singleDoc]);
  });

  it('creates multiple docs from an object', () => {
    firebase.create([examples.multipleDocs]);
  });

  it('creates multiple docs from two objects', () => {
    firebase.create([examples.singleDocBis, examples.singleDocTer]);
  });

  it('creates a doc with an array in a field', () => {
    firebase.create([examples.docWithArray]);
  });

  it('creates a doc with an object', () => {
    firebase.create([examples.docWithObject]);
  });

  it('creates a doc with a subcollection', () => {
    firebase.create([examples.docWithSubCollection]);
  });

  it('retrieves a document', () => {
    firebase.create([examples.singleDoc])
      .then(() => {
        const path = Object.keys(examples.singleDoc)[0];
        firebase.get([path]).then(data => {
          cy.log('Data retrieved : ', data);
          expect(Object.values(data)[0]).to.deep.equal(examples.singleDoc[path]);
        });
      })
  });

  it('retrieves a collection', () => {
    firebase.create([examples.multipleDocs])
      .then(() => {
        const collection = Object.keys(examples.multipleDocs)[0].split('/')[0];
        firebase.get([collection]).then(data => {
          cy.log('Collection retrieved : ', JSON.stringify(data));
          data[0].map(retrieved => {
            const exampleValues = Object.values(examples.multipleDocs);
            expect(exampleValues).to.deep.include(retrieved);
          });
        });
      })
  });

  it('retrieves an array of documents', () => {
    const docs = [examples.singleDoc, examples.singleDocBis, examples.singleDocTer];
    firebase.create(docs)
      .then(() => {
        const paths = docs.map(doc => Object.keys(doc)[0]);
        const exampleValues = docs.map(doc => Object.values(doc)[0]);
        firebase.get(paths).then(retrievedValues => expect(retrievedValues).to.deep.equal(exampleValues))
      })
  });

  it('retrieves an array of collections', () => {
    const docs = [examples.singleDoc, examples.multipleDocs];
    firebase.create(docs)
      .then(() => {
        const paths = docs.map(doc => Object.keys(doc)[0].split('/')[0]);
        const exampleValues = docs.map(doc => Object.values(doc));
        firebase.get(paths).then(retrievedValues => expect(retrievedValues).to.deep.equal(exampleValues));
      })
  });
  /*


  it('deletes a doc', () => {
    firebase.create({ ...examples.docToDelete });
    const path = Object.keys(examples.docToDelete)[0];
    firebase.get(path).then(data => {
      console.log('data : ', data);
      expect(Object.values(data)[0]).to.deep.equal(examples.docToDelete[path]);
    });
    firebase.delete(path);
    firebase.get(path).then(data => expect(data[0]).to.equal(null));
  });
*/
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
    ]).then(() => cy.log('example data deleted'));
  },

  //TODO : take care of subcollections
  delete(paths: string | string[]) {
    return cy.task('deleteData', paths);
  },

  get(paths: string[]) {
    return cy.task('getData', paths);
  },

  create(data: Record<string, object>[]) {
    return cy.task('importData', data);
  },

  //TODO : better type
  update(data: any | any[]) {
    return cy.task('updateData', { ...data });
  },
};
