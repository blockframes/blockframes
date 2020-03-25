module.exports = {
  name: 'e2e',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/e2e',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
