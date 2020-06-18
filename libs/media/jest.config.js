module.exports = {
  name: 'media',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/media',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
