const time = Date.now();

// The key works a follow : [`COLLECTION/DOC/SUBCOLLECTION`]
// If there is only a collection, then the ids for each document will be given by firestore
export const examples = {
  singleDoc: {
    // Collection + doc.id
    [`example-single/doc-${time}`]: {
      type: 'example',
      time: time,
    },
  },

  multipleDocs: {
    [`example-multiple/doc1-${time}`]: {
      type: 'example 1',
      time: time,
    },
    [`example-multiple/doc2-${time}`]: {
      type: 'example 2',
      time: time,
    },
    [`example-multiple/doc3-${time}`]: {
      type: 'example 3',
      time: time,
    },
  },

  // collection + random doc.ids
  multipleDocsBis: {
    ['example-multiple']: [
      {
        type: 'example 1',
        time: time,
      },
      {
        type: 'example 2',
        time: time,
      },
      {
        type: 'example 3',
        time: time,
      },
    ],
  },

  multipleDocsTer: {
    ['example-multiple2']: [
      {
        type: 'example 4',
        time: time,
      },
      {
        type: 'example 5',
        time: time,
      },
      {
        type: 'example 6',
        time: time,
      },
    ],
  },

  docWithArray: {
    [`example-array/doc-${time}`]: {
      type: 'example 1',
      time: time,
      array: ['data1', 'data2', 'data3'],
    },
  },

  docWithObjet: {
    [`example-object/doc-${time}`]: {
      type: 'example 1',
      time: time,
      object: { object1: 'data1', object2: 'data2', object3: 'data3' },
    },
  },

  // collection + doc.id + subcollection + random doc.id in subcollection
  docWithSubCollection: {
    [`example-subcollection/doc-${time}/subcollection`]: [
      {
        type: 'example 1',
        time: time,
      },
    ],
  },

  docToDelete: {
    [`example-deletion/doc-${time}`]: {
      type: 'example 1',
      time: time,
    },
  },
};
