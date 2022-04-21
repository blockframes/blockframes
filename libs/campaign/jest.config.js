module.exports = {
  name: 'organization-campaign',
  preset: '../../jest.preset.js',

  globals: {
    'ts-jest': {
      stringifyContentPathRegex: '\\.(html|svg)$',
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.(ts|html)$': 'ts-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!.*.mjs$)'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/organization/campaign',
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
