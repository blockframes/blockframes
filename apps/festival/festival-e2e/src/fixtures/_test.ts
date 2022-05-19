const time = Date.now();

// The key works a follow : [`COLLECTION/DOC/SUBCOLLECTION/SUBDOC`]
export const examples = {
  singleDoc: {
    // Collection + doc.id
    [`example-single/single1-${time}`]: {
      example: 'single 1',
      id: `single1-${time}`,
    },
  },

  singleDocBis: {
    [`example-single/single2-${time}`]: {
      example: 'single 2',
      id: `single2-${time}`,
    },
  },
  singleDocTer: {
    [`example-single/single3-${time}`]: {
      example: 'single 3',
      id: `single3-${time}`,
    },
  },
  multipleDocs: {
    [`example-multiple/multiple1-${time}`]: {
      example: 'multiple 1',
      id: `multiple1-${time}`,
    },
    [`example-multiple/multiple2-${time}`]: {
      example: 'multiple 2',
      id: `multiple2-${time}`,
    },
    [`example-multiple/multiple3-${time}`]: {
      example: 'multiple 3',
      id: `multiple3-${time}`,
    },
  },

  docWithArray: {
    [`example-array/array1-${time}`]: {
      array: ['data1', 'data2', 'data3'],
      example: 'array 1',
      id: `array1-${time}`,
    },
  },

  docWithObject: {
    [`example-object/object1-${time}`]: {
      example: 'object 1',
      id: `object1-${time}`,
      object: { object1: 'data1', object2: 'data2', object3: 'data3' },
    },
  },

  docWithSubCollection1: {
    // Collection + doc.id + subcollection + doc.id
    [`example-subcollection/doc1-${time}`]: {
      example: 'doc 1',
      id: `doc1-${time}`,
    },
    [`example-subcollection/doc1-${time}/subcollection1/subdoc1-${time}`]: {
      example: 'subdoc 1',
      id: `subdoc1-${time}`,
    },
    [`example-subcollection/doc1-${time}/subcollection2/subdoc2-${time}`]: {
      example: 'subdoc 2',
      id: `subdoc2-${time}`,
    },
    [`example-subcollection/doc1-${time}/subcollection2/subdoc3-${time}`]: {
      example: 'subdoc 3',
      id: `subdoc3-${time}`,
    },
  },

  docWithSubCollection2: {
    [`example-subcollection/doc2-${time}`]: {
      example: 'doc 2',
      id: `doc2-${time}`,
    },
    [`example-subcollection/doc2-${time}/subcollection3/subdoc4-${time}`]: {
      example: 'subdoc 4',
      id: `subdoc4-${time}`,
    },
  },

  docWithSubCollection3: {
    [`example-subcollectionBis/doc3-${time}`]: {
      example: 'doc 3',
      id: `doc3-${time}`,
    },
    [`example-subcollectionBis/doc3-${time}/subcollection4/subdoc5-${time}`]: {
      example: 'subdoc 5',
      id: `subdoc5-${time}`,
    },
  },

  docToDelete1: {
    [`example-deletion/delete1-${time}`]: {
      example: 'delete 1',
      id: `delete1-${time}`,
    },
  },

  docToDelete2: {
    [`example-deletion/delete2-${time}`]: {
      example: 'delete 2',
      id: `delete2-${time}`,
    },
  },

  docToDelete3: {
    [`example-deletion2/delete3-${time}`]: {
      example: 'delete 3',
      id: `delete3-${time}`,
    },
  },

  docWithSubCollectionToDelete1: {
    [`example-deletion/doc1-${time}`]: {
      example: 'deletion 1',
      id: `doc1-${time}`,
    },
    [`example-deletion/doc1-${time}/subcollection1/subdoc1-${time}`]: {
      example: 'deletion 1',
      id: `subdoc1-${time}`,
    },
    [`example-deletion/doc1-${time}/subcollection1/subdoc2-${time}`]: {
      example: 'deletion 2',
      id: `subdoc2-${time}`,
    },
    [`example-deletion/doc1-${time}/subcollection2/subdoc3-${time}`]: {
      example: 'deletion 3',
      id: `subdoc3-${time}`,
    },
  },

  docWithSubCollectionToDelete2: {
    [`example-deletion/doc2-${time}`]: {
      example: 'deletion 4',
      id: `doc2-${time}`,
    },
    [`example-deletion/doc2-${time}/subcollection1/subdoc1-${time}`]: {
      example: 'deletion 5',
      id: `subdoc4-${time}`,
    },
    [`example-deletion/doc2-${time}/subcollection1/subdoc2-${time}`]: {
      example: 'deletion 6',
      id: `subdoc5-${time}`,
    },
    [`example-deletion/doc2-${time}/subcollection2/subdoc1-${time}`]: {
      example: 'deletion 7',
      id: `subdoc6-${time}`,
    },
  },
};
