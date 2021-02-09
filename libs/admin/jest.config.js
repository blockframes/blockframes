module.exports = {
  name: 'admin',
  preset: '../../jest.preset.js',
  coverageDirectory: '../../coverage/libs/admin',
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$',
    },
  },
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/libs/admin',
};
