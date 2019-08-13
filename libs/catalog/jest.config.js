module.exports = {
  name: 'catalog',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/catalog',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
