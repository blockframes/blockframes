module.exports = {
  name: 'catalog',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/catalog',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
