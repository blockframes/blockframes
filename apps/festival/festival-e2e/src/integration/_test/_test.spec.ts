/// <reference types="cypress" />

import { cp } from 'fs/promises';
import { examples } from '../../fixtures/_test';

//* TESTS --------------------------------------*//

describe('Testing bridge between Cypress and node', () => {
  beforeEach(() => {
    firebase.clear();
  });

  //* CREATE *//

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
    firebase.create([examples.docWithSubCollection1]);
  });

  //* GET *//

  //*** docs without subcollections */

  it('retrieves a document', () => {
    firebase.create([examples.singleDoc]);
    const path = Object.keys(examples.singleDoc)[0];
    const exampleValues = exampleValuesFrom([examples.singleDoc]);
    firebase.get([path]).then(data => expect(data).to.eql(exampleValues.flat()));
  });

  it('retrieves a collection', () => {
    firebase.create([examples.multipleDocs]);
    const collectionPath = Object.keys(examples.multipleDocs)[0].split('/')[0];
    const exampleValues = exampleValuesFrom([examples.multipleDocs]);
    firebase.get([collectionPath]).then(data => expect(data).to.eql(exampleValues));
  });

  it('retrieves an array of documents', () => {
    const docs = [examples.singleDoc, examples.singleDocBis, examples.singleDocTer];
    firebase.create(docs);
    const paths = docs.map(doc => Object.keys(doc)[0]);
    const exampleValues = exampleValuesFrom(docs);
    firebase.get(paths).then(data => expect(data).to.eql(exampleValues.flat()));
  });

  it('retrieves an array of collections', () => {
    const docs = [examples.singleDoc, examples.multipleDocs];
    firebase.create(docs);
    const collectionsPaths = docs.map(doc => Object.keys(doc)[0].split('/')[0]);
    const exampleValues = exampleValuesFrom(docs);
    firebase.get(collectionsPaths).then(data => expect(data).to.eql(exampleValues));
  });

  //*** docs with subcollections */

  it('retrieves a document with subcollections', () => {
    firebase.create([examples.docWithSubCollection1]);
    const path = Object.keys(examples.docWithSubCollection1)[0];
    const parentDocPath = path.split('/').slice(0, 2).join('/');
    const exampleValues = exampleValuesFrom([examples.docWithSubCollection1]);
    firebase.get([parentDocPath]).then(data => expect(data).to.eql(exampleValues.flat()));
  });

  it('retrieves a collection of documents with subcollections', () => {
    const docs = [examples.docWithSubCollection1, examples.docWithSubCollection2];
    firebase.create(docs);
    const collectionPath = Object.keys(docs[0])[0].split('/')[0];
    const exampleValues = exampleValuesFrom(docs);
    firebase.get([collectionPath]).then(data => expect(data[0]).to.eql(exampleValues.flat()));
  });

  it('retrieves a array of documents with subcollections', () => {
    const docs = [examples.docWithSubCollection1, examples.docWithSubCollection2];
    firebase.create(docs);
    const docPaths = docs.map(doc => Object.keys(doc)[1].split('/').slice(0, 2).join('/'));
    const exampleValues = exampleValuesFrom(docs);
    firebase.get(docPaths).then(data => expect(data).to.eql(exampleValues.flat()));
  });

  it('retrieves an array of collection of documents with subcollections', () => {
    const docs = [examples.docWithSubCollection1, examples.docWithSubCollection2, examples.docWithSubCollection3];
    firebase.create(docs);
    // keeps only unique collection paths
    const collectionsPaths = [...new Set(docs.map(doc => Object.keys(doc)[0].split('/')[0]))];
    const exampleValues = exampleValuesFrom(docs);
    firebase.get(collectionsPaths).then((data: []) => expect(data.flat()).to.eql(exampleValues.flat()));
  });

  //* DELETE *//

  //*** docs without subcollections */

  it('deletes a doc', () => {
    firebase.create([examples.docToDelete1]);
    const path = Object.keys(examples.docToDelete1)[0];
    const exampleValues = exampleValuesFrom([examples.docToDelete1]);
    firebase.get([path]).then(data => expect(data).to.eql(exampleValues.flat()));
    firebase.delete([path]);
    firebase.get([path]).then(data => expect(data[0]).to.eql({}));
  });

  it('deletes a collection', () => {
    const docs = [examples.docToDelete1, examples.docToDelete2];
    firebase.create(docs);
    const collectionPath = Object.keys(examples.docToDelete1)[0].split('/')[0];
    const exampleValues = exampleValuesFrom(docs);
    firebase.get([collectionPath]).then((data: []) => expect(data.flat()).to.eql(exampleValues.flat()));
    firebase.delete([collectionPath]);
    cy.wait(100); // temporary async fix
    firebase.get([collectionPath]).then((data: []) => expect(data.flat()).to.eql([]));
  });

  it('deletes an array of documents', () => {
    const docs = [examples.docToDelete1, examples.docToDelete2];
    firebase.create(docs);
    const docPaths = docs.map(doc => Object.keys(doc)[0]);
    const exampleValues = exampleValuesFrom(docs);
    firebase.get(docPaths).then((data: []) => expect(data.flat()).to.eql(exampleValues.flat()));
    firebase.delete(docPaths);
    firebase.get(docPaths).then((data: []) => expect(data.flat()).to.eql([{}, {}]));
  });

  it('deletes an array of collection of documents', () => {
    const docs = [examples.docToDelete1, examples.docToDelete2, examples.docToDelete3];
    firebase.create(docs);
    const collectionsPaths = [...new Set(docs.map(doc => Object.keys(doc)[0]))];
    const exampleValues = exampleValuesFrom(docs);
    firebase.get(collectionsPaths).then((data: []) => expect(data.flat()).to.eql(exampleValues.flat()));
    firebase.delete(collectionsPaths);
    firebase.get(collectionsPaths).then((data: []) => expect(data.flat()).to.eql([{}, {}, {}]));
  });

  //*** docs with subcollections */

  it('deletes a document with subcollections', () => {
    firebase.create([examples.docWithSubCollectionToDelete1]);
    const path = Object.keys(examples.docWithSubCollectionToDelete1)[0];
    const parentDocPath = path.split('/').slice(0, 2).join('/');
    const exampleValues = exampleValuesFrom([examples.docWithSubCollectionToDelete1]);
    firebase.get([parentDocPath]).then(data => expect(data).to.eql(exampleValues.flat()));
    firebase.delete([parentDocPath]);
    firebase.get([parentDocPath]).then(data => expect(data[0]).to.eql({}));
  });

  it('deletes a collection of documents with subcollections', () => {
    const docs = [examples.docWithSubCollectionToDelete1, examples.docWithSubCollectionToDelete2];
    firebase.create(docs);
    const collectionPath = Object.keys(docs[0])[0].split('/')[0];
    const exampleValues = exampleValuesFrom(docs);
    firebase.get([collectionPath]).then(data => expect(data[0]).to.eql(exampleValues.flat()));
    firebase.delete([collectionPath]);
    cy.wait(100); // temporary async fix
    firebase.get([collectionPath]).then((data: []) => expect(data.flat()).to.eql([]));
  });

  it('deletes a array of documents with subcollections', () => {
    const docs = [examples.docWithSubCollectionToDelete1, examples.docWithSubCollectionToDelete2];
    firebase.create(docs);
    const docPaths = docs.map(doc => Object.keys(doc)[1].split('/').slice(0, 2).join('/'));
    const exampleValues = exampleValuesFrom(docs);
    firebase.get(docPaths).then(data => expect(data).to.eql(exampleValues.flat()));
    firebase.delete(docPaths);
    firebase.get(docPaths).then((data: []) => expect(data.flat()).to.eql([{}, {}]));
  });

  it('deletes an array of collection of documents with subcollections', () => {
    const docs = [
      examples.docWithSubCollectionToDelete1,
      examples.docWithSubCollectionToDelete2,
      examples.docWithSubCollectionToDelete3,
    ];
    firebase.create(docs);
    const collectionsPaths = [...new Set(docs.map(doc => Object.keys(doc)[0].split('/')[0]))];
    const exampleValues = exampleValuesFrom(docs);
    firebase.get(collectionsPaths).then((data: []) => expect(data.flat()).to.eql(exampleValues.flat()));
    firebase.delete(collectionsPaths);
    cy.wait(100); // temporary async fix
    firebase.get(collectionsPaths).then((data: []) => expect(data.flat()).to.eql([]));
  });

  //TODO : UPDATE
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
      'example-subcollectionBis',
      'example-deletion',
      'example-deletion2',
    ]);
  },

  delete(paths: string[]) {
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

const exampleValuesFrom = (examples: Record<string, object>[]) => {
  const result = [];
  examples.forEach(example => {
    let exampleValues = [];
    for (const [index, [key, value]] of Object.entries(Object.entries(example))) {
      const partsInPath = key.split('/').length;
      // data at the root of the doccument
      if (partsInPath === 2) {
        const exampleExists = index !== '0';
        if (exampleExists) {
          exampleValues.push({ ...value });
        } else {
          exampleValues = [{ ...value }];
        }
      }
      // data inside subcollection
      const subcollection = key.split('/')[2];
      if (partsInPath === 4) {
        const subcollectionExists = !!exampleValues[0][subcollection];
        if (subcollectionExists) {
          exampleValues[0][subcollection].push({ ...value });
        } else {
          exampleValues[0][subcollection] = [{ ...value }];
        }
      }
    }
    result.push(exampleValues);
  });

  return result;
};
