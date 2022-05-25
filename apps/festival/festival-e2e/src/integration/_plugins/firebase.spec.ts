/// <reference types="cypress" />

import { firebase } from '@blockframes/testing/cypress/browser';
import { examples } from '../../fixtures/_test';

//* TESTS --------------------------------------*//

describe('Testing bridge between Cypress and node', () => {
  describe('creation possibilities', () => {
    before(() => {
      firebase.clearTestData();
    });

    //* CREATE *//

    it('creates a single doc', () => {
      firebase.create([examples.simpleDoc]);
    });

    it('creates multiple docs from an object', () => {
      firebase.create([examples.multipleDocs]);
    });

    it('creates multiple docs from an array of objects', () => {
      firebase.create([examples.simpleDocBis, examples.simpleDocTer]);
    });

    it('creates a doc with an array in a field', () => {
      firebase.create([examples.docWithArray]);
    });

    it('creates a doc with an object', () => {
      firebase.create([examples.docWithObject]);
    });

    it('creates a doc with a subcollection', () => {
      firebase.create([examples.docWithSubcollection]);
    });
  });

  describe('create/get/delete', () => {
    before(() => {
      firebase.clearTestData();
    });

    //*** docs without subcollections */

    it('document', () => {
      firebase.create([examples.simpleDoc1]);
      const path = Object.keys(examples.simpleDoc1)[0];
      const exampleValues = exampleValuesFrom([examples.simpleDoc1]);
      firebase.get([path]).then(data => expect(data).to.eql(exampleValues.flat()));
      firebase.delete([path]);
      firebase.get([path]).then(data => expect(data[0]).to.eql({}));
    });

    it('collection', () => {
      const docs = [examples.simpleDoc2, examples.simpleDoc3];
      firebase.create(docs);
      const collectionPath = Object.keys(examples.simpleDoc2)[0].split('/')[0];
      const exampleValues = exampleValuesFrom(docs);
      firebase.get([collectionPath]).then((data: []) => expect(data.flat()).to.eql(exampleValues.flat()));
      firebase.delete([collectionPath]);
      firebase.get([collectionPath]).then((data: []) => expect(data.flat()).to.eql([]));
    });

    it('array of documents', () => {
      const docs = [examples.simpleDoc4, examples.simpleDoc5];
      firebase.create(docs);
      const docPaths = docs.map(doc => Object.keys(doc)[0]);
      const exampleValues = exampleValuesFrom(docs);
      firebase.get(docPaths).then((data: []) => expect(data.flat()).to.eql(exampleValues.flat()));
      firebase.delete(docPaths);
      firebase.get(docPaths).then((data: []) => expect(data.flat()).to.eql([{}, {}]));
    });

    it('array of collection', () => {
      const docs = [examples.simpleDoc6, examples.simpleDoc7, examples.simpleDoc8];
      firebase.create(docs);
      const collectionsPaths = [...new Set(docs.map(doc => Object.keys(doc)[0]))];
      const exampleValues = exampleValuesFrom(docs);
      firebase.get(collectionsPaths).then((data: []) => expect(data.flat()).to.eql(exampleValues.flat()));
      firebase.delete(collectionsPaths);
      firebase.get(collectionsPaths).then((data: []) => expect(data.flat()).to.eql([{}, {}, {}]));
    });

    //*** docs with subcollections */

    it('document with subcollections', () => {
      firebase.create([examples.docWithSubcollection1]);
      const path = Object.keys(examples.docWithSubcollection1)[0];
      const parentDocPath = path.split('/').slice(0, 2).join('/');
      const exampleValues = exampleValuesFrom([examples.docWithSubcollection1]);
      firebase.get([parentDocPath]).then(data => expect(data).to.eql(exampleValues.flat()));
      firebase.delete([parentDocPath]);
      firebase.get([parentDocPath]).then(data => expect(data[0]).to.eql({}));
    });

    it('collection of documents with subcollections', () => {
      const docs = [examples.docWithSubcollection2, examples.docWithSubcollection3];
      firebase.create(docs);
      const collectionPath = Object.keys(docs[0])[0].split('/')[0];
      const exampleValues = exampleValuesFrom(docs);
      firebase.get([collectionPath]).then(data => expect(data[0]).to.eql(exampleValues.flat()));
      firebase.delete([collectionPath]);
      firebase.get([collectionPath]).then((data: []) => expect(data.flat()).to.eql([]));
    });

    it('array of documents with subcollections', () => {
      const docs = [examples.docWithSubcollection4, examples.docWithSubcollection5];
      firebase.create(docs);
      const docPaths = docs.map(doc => Object.keys(doc)[1].split('/').slice(0, 2).join('/'));
      const exampleValues = exampleValuesFrom(docs);
      firebase.get(docPaths).then(data => expect(data).to.eql(exampleValues.flat()));
      firebase.delete(docPaths);
      firebase.get(docPaths).then((data: []) => expect(data.flat()).to.eql([{}, {}]));
    });

    it('array of collections of documents with subcollections', () => {
      const docs = [examples.docWithSubcollection6, examples.docWithSubcollection7, examples.docWithSubcollection8];
      firebase.create(docs);
      const collectionsPaths = [...new Set(docs.map(doc => Object.keys(doc)[0].split('/')[0]))];
      const exampleValues = exampleValuesFrom(docs);
      firebase.get(collectionsPaths).then((data: []) => expect(data.flat()).to.eql(exampleValues.flat()));
      firebase.delete(collectionsPaths);
      firebase.get(collectionsPaths).then((data: []) => expect(data.flat()).to.eql([]));
    });
  });

  describe('create/update', () => {
    before(() => {
      firebase.clearTestData();
    });

    it('a doc', () => {
      firebase.create([examples.simpleDoc1]);
      const docPath = Object.keys(examples.simpleDoc1)[0];
      const exampleValues = exampleValuesFrom([examples.simpleDoc1]);
      firebase.get([docPath]).then(data => expect(data).to.eql(exampleValues.flat()));
      const updateExamples = {
        boolean: true,
        string: 'value',
        number: 123,
        array: [1, 2, 3],
        object: { property: 'object value' },
      };
      const updates = [];
      for (const [key, value] of Object.entries(updateExamples)) {
        updates.push({ docPath, field: key, value });
      }
      firebase.update(updates);
      firebase.get([docPath]).then(data => expect(data[0]).to.deep.include(updateExamples));
    });

    it('a doc in a subcollection', () => {
      firebase.create([examples.docWithSubcollection1]);
      const docPath = Object.keys(examples.docWithSubcollection1)[0];
      const subDocPath = Object.keys(examples.docWithSubcollection1)[1];
      const exampleValues = exampleValuesFrom([examples.docWithSubcollection1]);
      firebase.get([docPath]).then(data => expect(data).to.eql(exampleValues.flat()));
      const updateExamples = {
        boolean: true,
        string: 'value',
        number: 123,
        array: [1, 2, 3],
        object: { property: 'object value' },
      };
      const updates = [];
      for (const [key, value] of Object.entries(updateExamples)) {
        updates.push({ docPath: subDocPath, field: key, value });
      }
      firebase.update(updates);
      const subCollectionName = Object.keys(examples.docWithSubcollection1)[1].split('/')[2];
      firebase.get([docPath]).then(data => expect(data[0][subCollectionName][0]).to.deep.include(updateExamples));
    });
  });
});

//* FUNCTIONS -------------------------------*//

const exampleValuesFrom = (examples: Record<string, object>[]) => {
  const result = [];
  examples.forEach(example => {
    let exampleValues = [];
    for (const [index, [key, value]] of Object.entries(Object.entries(example))) {
      const partsInPath = key.split('/').length;
      value['_meta'] = { e2e: true };
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
