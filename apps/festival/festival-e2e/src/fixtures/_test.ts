const time = Date.now();

export const examples = {
  singleDoc: {
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

  docWithSubCollection: {
    [`example-subcollection/doc-${time}/subcollection`]: [
      {
        type: 'example 1',
        time: time,
      },
    ],
  },
};
