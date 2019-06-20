module.exports = {
  name: 'rights',
  preset: '../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/rights',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
