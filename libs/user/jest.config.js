module.exports = {
  name: 'user',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/user',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
