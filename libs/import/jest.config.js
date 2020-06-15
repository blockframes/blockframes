module.exports = {
  name: 'import',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/import',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
