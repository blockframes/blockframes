const time = Date.now();

// The key works a follow : [`COLLECTION/DOC/SUBCOLLECTION/SUBDOC`]
export const examples = {
  //* CREATE examples

  simpleDoc: {
    // collection + doc.id
    [`ex-create-simple/simple1-${time}`]: {
      example: 'simple 1',
      id: `simple1-${time}`,
    },
  },

  simpleDocBis: {
    [`ex-create-simple/simple2-${time}`]: {
      example: 'simple 2',
      id: `simple2-${time}`,
    },
  },

  simpleDocTer: {
    [`ex-create-simple/simple3-${time}`]: {
      example: 'simple 3',
      id: `simple3-${time}`,
    },
  },

  multipleDocs: {
    [`ex-create-multiple/multiple1-${time}`]: {
      example: 'multiple 1',
      id: `multiple1-${time}`,
    },
    [`ex-create-multiple/multiple2-${time}`]: {
      example: 'multiple 2',
      id: `multiple2-${time}`,
    },
    [`ex-create-multiple/multiple3-${time}`]: {
      example: 'multiple 3',
      id: `multiple3-${time}`,
    },
  },

  docWithArray: {
    [`ex-create-array/array1-${time}`]: {
      array: ['data1', 'data2', 'data3'],
      example: 'array 1',
      id: `array1-${time}`,
    },
  },

  docWithObject: {
    [`ex-create-object/object1-${time}`]: {
      example: 'object 1',
      id: `object1-${time}`,
      object: { object1: 'data1', object2: 'data2', object3: 'data3' },
    },
  },

  docWithSubcollection: {
    // collection + doc.id + subcollection + doc.id
    [`ex-subcollection/doc1-${time}`]: {
      example: 'doc 1',
      id: `doc1-${time}`,
    },
    // first subcollection
    [`ex-subcollection/doc1-${time}/subcollection1/subdoc1-${time}`]: {
      example: 'subdoc 1',
      id: `subdoc1-${time}`,
    },
    [`ex-subcollection/doc1-${time}/subcollection1/subdoc2-${time}`]: {
      example: 'subdoc 2',
      id: `subdoc2-${time}`,
    },
    // second subcollection
    [`ex-subcollection/doc1-${time}/subcollection2/subdoc3-${time}`]: {
      example: 'subdoc 3',
      id: `subdoc3-${time}`,
    },
  },

  //* CRUD example

  //*** docs without subcollections */

  // doc test
  simpleDoc1: {
    [`ex-crud-simple1/simple1-${time}`]: {
      example: 'simple 1',
      id: `simple1-${time}`,
    },
  },
  //--------

  // collection test
  simpleDoc2: {
    [`ex-crud-simple2/simple1-${time}`]: {
      example: 'simple 1',
      id: `simple1-${time}`,
    },
  },
  simpleDoc3: {
    [`ex-crud-simple2/simple2-${time}`]: {
      example: 'simple 2',
      id: `simple2-${time}`,
    },
  },
  //--------

  // array test
  simpleDoc4: {
    [`ex-crud-simple3/simple1-${time}`]: {
      example: 'simple 1',
      id: `simple1-${time}`,
    },
  },
  simpleDoc5: {
    [`ex-crud-simple3/simple2-${time}`]: {
      example: 'simple 2',
      id: `simple2-${time}`,
    },
  },
  //--------

  // array of collections test
  simpleDoc6: {
    [`ex-crud-simple4/simple1-${time}`]: {
      example: 'simple 1',
      id: `simple1-${time}`,
    },
  },
  simpleDoc7: {
    [`ex-crud-simple4/simple2-${time}`]: {
      example: 'simple 2',
      id: `simple2-${time}`,
    },
  },
  simpleDoc8: {
    [`ex-crud-simple5/simple3-${time}`]: {
      example: 'simple 3',
      id: `simple3-${time}`,
    },
  },

  //*** docs with subcollections */

  // doc test
  docWithSubcollection1: {
    [`ex-crud-subcollection1/doc1-${time}`]: {
      example: 'doc 1',
      id: `doc1-${time}`,
    },
    [`ex-crud-subcollection1/doc1-${time}/subcollection1/subdoc1-${time}`]: {
      example: 'subdoc 1',
      id: `subdoc1-${time}`,
    },
    [`ex-crud-subcollection1/doc1-${time}/subcollection2/subdoc2-${time}`]: {
      example: 'subdoc 2',
      id: `subdoc2-${time}`,
    },
    [`ex-crud-subcollection1/doc1-${time}/subcollection2/subdoc3-${time}`]: {
      example: 'subdoc 3',
      id: `subdoc3-${time}`,
    },
  },
  //--------

  // collection test
  docWithSubcollection2: {
    [`ex-crud-subcollection2/doc1-${time}`]: {
      example: 'doc 1',
      id: `doc1-${time}`,
    },
    [`ex-crud-subcollection2/doc1-${time}/subcollection1/subdoc1-${time}`]: {
      example: 'subdoc 1',
      id: `subdoc1-${time}`,
    },
    [`ex-crud-subcollection2/doc1-${time}/subcollection2/subdoc2-${time}`]: {
      example: 'subdoc 2',
      id: `subdoc2-${time}`,
    },
    [`ex-crud-subcollection2/doc1-${time}/subcollection2/subdoc3-${time}`]: {
      example: 'subdoc 3',
      id: `subdoc3-${time}`,
    },
  },
  docWithSubcollection3: {
    [`ex-crud-subcollection2/doc2-${time}`]: {
      example: 'doc 2',
      id: `doc2-${time}`,
    },
    [`ex-crud-subcollection2/doc2-${time}/subcollection1/subdoc4-${time}`]: {
      example: 'subdoc 4',
      id: `subdoc4-${time}`,
    },
    [`ex-crud-subcollection2/doc2-${time}/subcollection2/subdoc5-${time}`]: {
      example: 'subdoc 5',
      id: `subdoc5-${time}`,
    },
    [`ex-crud-subcollection2/doc2-${time}/subcollection2/subdoc6-${time}`]: {
      example: 'subdoc 6',
      id: `subdoc6-${time}`,
    },
  },
  //--------

  // array test
  docWithSubcollection4: {
    [`ex-crud-subcollection3/doc1-${time}`]: {
      example: 'doc 1',
      id: `doc1-${time}`,
    },
    [`ex-crud-subcollection3/doc1-${time}/subcollection1/subdoc1-${time}`]: {
      example: 'subdoc 1',
      id: `subdoc1-${time}`,
    },
    [`ex-crud-subcollection3/doc1-${time}/subcollection2/subdoc2-${time}`]: {
      example: 'subdoc 2',
      id: `subdoc2-${time}`,
    },
    [`ex-crud-subcollection3/doc1-${time}/subcollection2/subdoc3-${time}`]: {
      example: 'subdoc 3',
      id: `subdoc3-${time}`,
    },
  },
  docWithSubcollection5: {
    [`ex-crud-subcollection3/doc2-${time}`]: {
      example: 'doc 2',
      id: `doc2-${time}`,
    },
    [`ex-crud-subcollection3/doc2-${time}/subcollection1/subdoc4-${time}`]: {
      example: 'subdoc 4',
      id: `subdoc4-${time}`,
    },
    [`ex-crud-subcollection3/doc2-${time}/subcollection2/subdoc5-${time}`]: {
      example: 'subdoc 5',
      id: `subdoc5-${time}`,
    },
    [`ex-crud-subcollection3/doc2-${time}/subcollection2/subdoc6-${time}`]: {
      example: 'subdoc 6',
      id: `subdoc6-${time}`,
    },
  },
  //--------

  // array of collections test
  docWithSubcollection6: {
    [`ex-crud-subcollection4/doc1-${time}`]: {
      example: 'doc 1',
      id: `doc1-${time}`,
    },
    [`ex-crud-subcollection4/doc1-${time}/subcollection1/subdoc1-${time}`]: {
      example: 'subdoc 1',
      id: `subdoc1-${time}`,
    },
    [`ex-crud-subcollection4/doc1-${time}/subcollection2/subdoc2-${time}`]: {
      example: 'subdoc 2',
      id: `subdoc2-${time}`,
    },
    [`ex-crud-subcollection4/doc1-${time}/subcollection2/subdoc3-${time}`]: {
      example: 'subdoc 3',
      id: `subdoc3-${time}`,
    },
  },
  docWithSubcollection7: {
    [`ex-crud-subcollection4/doc2-${time}`]: {
      example: 'doc 2',
      id: `doc2-${time}`,
    },
    [`ex-crud-subcollection4/doc2-${time}/subcollection1/subdoc4-${time}`]: {
      example: 'subdoc 4',
      id: `subdoc4-${time}`,
    },
    [`ex-crud-subcollection4/doc2-${time}/subcollection2/subdoc5-${time}`]: {
      example: 'subdoc 5',
      id: `subdoc5-${time}`,
    },
    [`ex-crud-subcollection4/doc2-${time}/subcollection2/subdoc6-${time}`]: {
      example: 'subdoc 6',
      id: `subdoc6-${time}`,
    },
  },
  docWithSubcollection8: {
    [`ex-crud-subcollection5/doc3-${time}`]: {
      example: 'doc 3',
      id: `doc3-${time}`,
    },
    [`ex-crud-subcollection5/doc3-${time}/subcollection1/subdoc7-${time}`]: {
      example: 'subdoc 7',
      id: `subdoc7-${time}`,
    },
    [`ex-crud-subcollection5/doc3-${time}/subcollection2/subdoc8-${time}`]: {
      example: 'subdoc 8',
      id: `subdoc8-${time}`,
    },
    [`ex-crud-subcollection5/doc3-${time}/subcollection2/subdoc9-${time}`]: {
      example: 'subdoc 9',
      id: `subdoc9-${time}`,
    },
  },

  //* QUERY example

  collectionToQuery: {
    ['ex-query/doc1']: {
      example: 'doc 1',
      id: `doc1-${time}`,
      textField: 'find me',
      numericField: 0,
      arrayField: ['North', 'East', 'West'],
    },
    ['ex-query/doc2']: {
      example: 'doc 2',
      id: `doc2-${time}`,
      textField: 'do not find me',
      numericField: 1,
      arrayField: ['East', 'South'],
    },
    ['ex-query/doc3']: {
      example: 'doc 3',
      id: `doc3-${time}`,
      textField: 'do not find me',
      numericField: 2,
      arrayField: ['North', 'West'],
    },
    ['ex-query/doc4']: {
      example: 'doc 4',
      id: `doc4-${time}`,
      textField: 'find me',
      numericField: 3,
      arrayField: ['North', 'East'],
    },
  },
};
