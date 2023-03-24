/// <reference types="cypress" />

import { firestore, maintenance } from '@blockframes/testing/cypress/browser';
import { examples } from '../../fixtures/plugins/firestore';

//* TESTS --------------------------------------*//

describe('Testing bridge between Cypress and node', () => {
  describe('creation possibilities', () => {
    before(() => {
      maintenance.start();
      firestore.clearTestData();
      maintenance.end();
    });

    //* CREATE *//

    it('creates a single doc', () => {
      firestore.create([examples.simpleDoc]);
    });

    it('creates multiple docs from an object', () => {
      firestore.create([examples.multipleDocs]);
    });

    it('creates multiple docs from an array of objects', () => {
      firestore.create([examples.simpleDocBis, examples.simpleDocTer]);
    });

    it('creates a doc with an array in a field', () => {
      firestore.create([examples.docWithArray]);
    });

    it('creates a doc with an object', () => {
      firestore.create([examples.docWithObject]);
    });

    it('creates a doc with a subcollection', () => {
      firestore.create([examples.docWithSubcollection]);
    });
  });

  describe('create / get / delete', () => {
    before(() => {
      maintenance.start();
      firestore.clearTestData();
      maintenance.end();
    });

    //*** docs without subcollections */

    it('document', () => {
      const path = Object.keys(examples.simpleDoc1)[0];
      const exampleValues = exampleValuesFrom([examples.simpleDoc1]);
      firestore.create([examples.simpleDoc1]);
      firestore.get([path]).then(data => expect(data).to.eql(exampleValues.flat()));
      firestore.delete([path]);
      firestore.get([path]).then(data => expect(data[0]).to.eql({}));
    });

    it('collection', () => {
      const docs = [examples.simpleDoc2, examples.simpleDoc3];
      const collectionPath = Object.keys(examples.simpleDoc2)[0].split('/')[0];
      const exampleValues = exampleValuesFrom(docs);
      firestore.create(docs);
      firestore.get([collectionPath]).then((data: []) => expect(data.flat()).to.eql(exampleValues.flat()));
      firestore.delete([collectionPath]);
      firestore.get([collectionPath]).then((data: []) => expect(data.flat()).to.eql([]));
    });

    it('array of documents', () => {
      const docs = [examples.simpleDoc4, examples.simpleDoc5];
      const docPaths = docs.map(doc => Object.keys(doc)[0]);
      const exampleValues = exampleValuesFrom(docs);
      firestore.create(docs);
      firestore.get(docPaths).then((data: []) => expect(data.flat()).to.eql(exampleValues.flat()));
      firestore.delete(docPaths);
      firestore.get(docPaths).then((data: []) => expect(data.flat()).to.eql([{}, {}]));
    });

    it('array of collection', () => {
      const docs = [examples.simpleDoc6, examples.simpleDoc7, examples.simpleDoc8];
      const collectionsPaths = [...new Set(docs.map(doc => Object.keys(doc)[0]))];
      const exampleValues = exampleValuesFrom(docs);
      firestore.create(docs);
      firestore.get(collectionsPaths).then((data: []) => expect(data.flat()).to.eql(exampleValues.flat()));
      firestore.delete(collectionsPaths);
      firestore.get(collectionsPaths).then((data: []) => expect(data.flat()).to.eql([{}, {}, {}]));
    });

    //*** docs with subcollections */

    it('document with subcollections', () => {
      const path = Object.keys(examples.docWithSubcollection1)[0];
      const parentDocPath = path.split('/').slice(0, 2).join('/');
      const exampleValues = exampleValuesFrom([examples.docWithSubcollection1]);
      firestore.create([examples.docWithSubcollection1]);
      firestore.get([parentDocPath]).then(data => expect(data).to.eql(exampleValues.flat()));
      firestore.delete([parentDocPath]);
      firestore.get([parentDocPath]).then(data => expect(data[0]).to.eql({}));
    });

    it('collection of documents with subcollections', () => {
      const docs = [examples.docWithSubcollection2, examples.docWithSubcollection3];
      const collectionPath = Object.keys(docs[0])[0].split('/')[0];
      const exampleValues = exampleValuesFrom(docs);
      firestore.create(docs);
      firestore.get([collectionPath]).then(data => expect(data[0]).to.eql(exampleValues.flat()));
      firestore.delete([collectionPath]);
      firestore.get([collectionPath]).then((data: []) => expect(data.flat()).to.eql([]));
    });

    it('array of documents with subcollections', () => {
      const docs = [examples.docWithSubcollection4, examples.docWithSubcollection5];
      const docPaths = docs.map(doc => Object.keys(doc)[1].split('/').slice(0, 2).join('/'));
      const exampleValues = exampleValuesFrom(docs);
      firestore.create(docs);
      firestore.get(docPaths).then(data => expect(data).to.eql(exampleValues.flat()));
      firestore.delete(docPaths);
      firestore.get(docPaths).then((data: []) => expect(data.flat()).to.eql([{}, {}]));
    });

    it('array of collections of documents with subcollections', () => {
      const docs = [examples.docWithSubcollection6, examples.docWithSubcollection7, examples.docWithSubcollection8];
      const collectionsPaths = [...new Set(docs.map(doc => Object.keys(doc)[0].split('/')[0]))];
      const exampleValues = exampleValuesFrom(docs);
      firestore.create(docs);
      firestore.get(collectionsPaths).then((data: []) => expect(data.flat()).to.eql(exampleValues.flat()));
      firestore.delete(collectionsPaths);
      firestore.get(collectionsPaths).then((data: []) => expect(data.flat()).to.eql([]));
    });
  });

  describe('create / update', () => {
    before(() => {
      maintenance.start();
      firestore.clearTestData();
      maintenance.end();
    });

    it('a doc', () => {
      const docPath = Object.keys(examples.simpleDoc1)[0];
      const exampleValues = exampleValuesFrom([examples.simpleDoc1]);
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
      firestore.create([examples.simpleDoc1]);
      firestore.get([docPath]).then(data => expect(data).to.eql(exampleValues.flat()));
      firestore.update(updates);
      firestore.get([docPath]).then(data => expect(data[0]).to.deep.include(updateExamples));
    });

    it('a doc in a subcollection', () => {
      const docPath = Object.keys(examples.docWithSubcollection1)[0];
      const subDocPath = Object.keys(examples.docWithSubcollection1)[1];
      const exampleValues = exampleValuesFrom([examples.docWithSubcollection1]);
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
      const subCollectionName = Object.keys(examples.docWithSubcollection1)[1].split('/')[2];
      firestore.create([examples.docWithSubcollection1]);
      firestore.get([docPath]).then(data => expect(data).to.eql(exampleValues.flat()));
      firestore.update(updates);
      firestore.get([docPath]).then(data => expect(data[0][subCollectionName][0]).to.deep.include(updateExamples));
    });
  });

  //*** QUERY */

  describe('query', () => {
    before(() => {
      maintenance.start();
      firestore.clearTestData();
      firestore.create([examples.collectionToQuery]);
      maintenance.end();
    });

    it('less than', () => {
      firestore
        .queryData({ collection: 'ex-query', field: 'numericField', operator: '<', value: 2 })
        .then(data => expect(data).to.eql([queryDoc(1), queryDoc(2)]));
    });

    it('less than or equal', () => {
      firestore
        .queryData({ collection: 'ex-query', field: 'numericField', operator: '<=', value: 2 })
        .then(data => expect(data).to.eql([queryDoc(1), queryDoc(2), queryDoc(3)]));
    });

    it('more than', () => {
      firestore
        .queryData({ collection: 'ex-query', field: 'numericField', operator: '>', value: 2 })
        .then(data => expect(data).to.eql([queryDoc(4)]));
    });

    it('more than or equal', () => {
      firestore
        .queryData({ collection: 'ex-query', field: 'numericField', operator: '>=', value: 2 })
        .then(data => expect(data).to.eql([queryDoc(3), queryDoc(4)]));
    });

    it('equal number', () => {
      firestore
        .queryData({ collection: 'ex-query', field: 'numericField', operator: '==', value: 2 })
        .then(data => expect(data).to.eql([queryDoc(3)]));
    });

    it('not equal number', () => {
      firestore
        .queryData({ collection: 'ex-query', field: 'numericField', operator: '!=', value: 2 })
        .then(data => expect(data).to.eql([queryDoc(1), queryDoc(2), queryDoc(4)]));
    });

    it('equal text', () => {
      firestore
        .queryData({ collection: 'ex-query', field: 'textField', operator: '==', value: 'find me' })
        .then(data => expect(data).to.eql([queryDoc(1), queryDoc(4)]));
    });

    it('not equal text', () => {
      firestore
        .queryData({ collection: 'ex-query', field: 'textField', operator: '!=', value: 'find me' })
        .then(data => expect(data).to.eql([queryDoc(2), queryDoc(3)]));
    });

    it('array contains any', () => {
      firestore
        .queryData({ collection: 'ex-query', field: 'arrayField', operator: 'array-contains-any', value: ['North', 'West'] })
        .then(data => expect(data).to.eql([queryDoc(1), queryDoc(3), queryDoc(4)]));
    });

    it('in', () => {
      firestore
        .queryData({ collection: 'ex-query', field: 'numericField', operator: 'in', value: [2, 3] })
        .then(data => expect(data).to.eql([queryDoc(3), queryDoc(4)]));
    });

    it('not in', () => {
      firestore
        .queryData({ collection: 'ex-query', field: 'numericField', operator: 'not-in', value: [2, 3] })
        .then(data => expect(data).to.eql([queryDoc(1), queryDoc(2)]));
    });
  });
});

//* FUNCTIONS -------------------------------*//

const exampleValuesFrom = (_examples: Record<string, object>[]) => {
  const examples: typeof _examples = JSON.parse(JSON.stringify(_examples)); //to avoid original object being altered
  const result = [];
  for (const example of examples) {
    const values = [];
    for (const [path, document] of Object.entries(example)) {
      document['_meta'] = { e2e: true };
      const partsInPath = path.split('/').length;
      // data in document
      if (partsInPath === 2) values.push(document);
      // data in subcollection
      const subcollection = path.split('/')[2];
      if (partsInPath === 4) {
        const subcollectionExists = !!values[0][subcollection];
        if (subcollectionExists) {
          values[0][subcollection].push(document);
        } else {
          values[0][subcollection] = [document];
        }
      }
    }
    result.push(values);
  }
  return result;
};

const queryDoc = (index: number) => {
  const result = { ...examples.collectionToQuery[`ex-query/doc${index}`] };
  result['_meta'] = { e2e: true };
  return result;
};
