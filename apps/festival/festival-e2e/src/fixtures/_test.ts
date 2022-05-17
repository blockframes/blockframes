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

  docWithSubCollection: {
    // Collection + doc.id + subcollection + doc.id
    [`example-subcollection/doc-${time}/subcollection/subdoc1-${time}`]: {
      example: 'subdoc 1',
      id: `subdoc1-${time}`,
    },
  },

  docToDelete: {
    [`example-deletion/delete1-${time}`]: {
      example: 'delete 1',
      id: `delete1-${time}`,
    },
  },
};
