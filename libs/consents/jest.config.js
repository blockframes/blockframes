module.exports = {
  preset: '../../jest.preset.js',
  transform: {
    '^.+.(ts|mjs|js|html)$': 'jest-preset-angular'
  },
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  transformIgnorePatterns: ['node_modules/(?!.*.mjs$)'],
  coverageDirectory: '../../coverage/libs/consents',
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
