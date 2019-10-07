module.exports = {
  name: 'e2e',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/e2e',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
