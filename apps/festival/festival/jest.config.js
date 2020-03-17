module.exports = {
  name: 'festival-festival',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/apps/festival/festival',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
