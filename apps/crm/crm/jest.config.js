module.exports = {
  name: 'crm-crm',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/apps/crm/crm',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
