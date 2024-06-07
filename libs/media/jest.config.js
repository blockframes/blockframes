module.exports = {
  preset: '../../jest.preset.js',
  transform: {
    '^.+.(ts|mjs|js|html)$': ['jest-preset-angular', { stringifyContentPathRegex: '\\.(html|svg)$' }]
  },
  transformIgnorePatterns: ['node_modules/(?!.*.mjs$)'],
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/libs/media',
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
