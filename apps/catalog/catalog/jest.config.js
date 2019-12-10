module.exports = {
  name: 'catalog',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/catalog',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
