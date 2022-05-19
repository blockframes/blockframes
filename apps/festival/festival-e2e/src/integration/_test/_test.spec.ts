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
    const collection = Object.keys(examples.multipleDocs)[0].split('/')[0];
    const exampleValues = exampleValuesFrom([examples.multipleDocs]);
    firebase.get([collection]).then(data => expect(data).to.eql(exampleValues));
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
    const paths = docs.map(doc => Object.keys(doc)[0].split('/')[0]);
    const exampleValues = exampleValuesFrom(docs);
    firebase.get(paths).then(data => expect(data).to.eql(exampleValues));
  });

  //*** docs without subcollections */

  it('retrieves a document and its subcollections', () => {
    firebase.create([examples.docWithSubCollection1]);
    const path = Object.keys(examples.docWithSubCollection1)[0];
    const parentDocPath = path.split('/').slice(0, 2).join('/');
    const exampleValues = exampleValuesFrom([examples.docWithSubCollection1]);
    firebase.get([parentDocPath]).then(data => expect(data).to.eql(exampleValues.flat()));
  });

  //TODO : retrieves an array of documents with subcollections

  //TODO : retrieves a collection of documents with subcollections

  //TODO : retrieves an array of collection of documents with subcollections

  //* DELETE *//

  //*** docs without subcollections */

  it('deletes a doc', () => {
    firebase.create([examples.docToDelete]);
    const path = Object.keys(examples.docToDelete)[0];
    const exampleValues = exampleValuesFrom([examples.docToDelete]);
    firebase.get([path]).then(data => expect(data).to.eql(exampleValues.flat()));
    firebase.delete([path]);
    firebase.get([path]).then(data => expect(data[0]).to.eql({}));
  });

  //TODO : below test WIP
  /*   it.only('deletes an array of documents with their subcollections', () => {
    const docs = [examples.docWithSubCollectionToDelete1, examples.docWithSubCollectionToDelete2];
    firebase.create(docs);
    const docPaths = docs.map(doc => Object.keys(doc)[1] .split('/').slice(0, 2).join('/'));
    console.log(docPaths)
    const exampleValues = exampleValuesFrom(docs)
    firebase.get(docPaths).then(data => {
      console.log(exampleValues)
      console.log(data);
    });
  }); */

  //TODO : deletes a collection of documents

  //TODO : deletes an array of collection of documents

  //*** docs with subcollections */

  //TODO : below tests WIP
  /*   it('deletes a doc with its subcollections', () => {
    firebase.create([examples.docWithSubCollectionToDelete1]);
    const path = Object.keys(examples.docWithSubCollectionToDelete1)[0];
    const parentDocPath = path.split('/').slice(0, 2).join('/');
    console.log(parentDocPath);
    firebase.get([parentDocPath]).then(data => {
      console.log(data);
      //expect(Object.values(data)[0]).to.deep.equal(examples.docWithSubCollectionToDelete1[path]);
    });
    firebase.delete([parentDocPath]);

  });

  it('deletes a collection with documents with subcollections', () => {
    const docs = [examples.docWithSubCollectionToDelete1, examples.docWithSubCollectionToDelete2];
    firebase.create(docs);
    const collectionPath = Object.keys(docs[0])[0].split('/')[0];
    console.log('paths', collectionPath);
    firebase.get([collectionPath]).then(data => {
      console.log(data);
    });
    //cy.pause()
    //firebase.delete([collectionPath])
  }); */

  //TODO : deletes a collection of documents with subcollections

  //TODO : deletes an array of collection of documents with subcollections

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
      'example-deletion',
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
        //TODO : below line crashes for multiple docs => to fix
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
