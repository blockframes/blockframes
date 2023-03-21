module.exports = {
  name: 'admin',

  coverageDirectory: '../../coverage/libs/admin',
  globals: {
    'ts-jest': {
      stringifyContentPathRegex: '\\.(html|svg)$',
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/libs/admin',
  preset: '../../jest.preset.ts',
};
