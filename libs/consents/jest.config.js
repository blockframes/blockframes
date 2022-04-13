module.exports = {
  name: 'consents',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      stringifyContentPathRegex: '\\.(html|svg)$',
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+.(ts|mjs|js|html)$': 'jest-preset-angular'
  },
  testEnvironment: '<rootDir>/jest-environment.js',
  transformIgnorePatterns: ['node_modules/(?!.*.mjs$)'],
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/libs/consents',
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
