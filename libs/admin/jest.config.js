module.exports = {
  name: 'admin',
  preset: '../../jest.preset.js',
  coverageDirectory: '../../coverage/libs/admin',
  globals: {
    'ts-jest': {
      stringifyContentPathRegex: '\\.(html|svg)$',
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
};
