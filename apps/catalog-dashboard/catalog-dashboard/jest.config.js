module.exports = {
  name: 'catalog-dashboard',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/apps/catalog-dashboard/catalog-dashboard',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
