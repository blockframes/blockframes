module.exports = {
  name: 'testing-unit-tests',
  preset: '../../../jest.preset.js',
  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' },
  },
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html', 'json'],
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/testing/unit-tests',
};
