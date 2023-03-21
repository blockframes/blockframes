module.exports = {
  name: 'notification',

  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' },
  },
  transform: {
    '^.+.(ts|mjs|js|html)$': 'jest-preset-angular',
  },
  testEnvironment: '<rootDir>/jest-environment.js',
  transformIgnorePatterns: ['node_modules/(?!.*.mjs$)'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/libs/notification',
  preset: '../../jest.preset.ts',
};
