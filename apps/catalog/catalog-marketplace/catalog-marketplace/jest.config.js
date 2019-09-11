module.exports = {
  name: 'catalog-marketplace',
  preset: '../../../../jest.config.js',
  coverageDirectory: '../../../../coverage/apps/catalog-marketplace/catalog-marketplace',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
