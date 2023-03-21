module.exports = {
  name: 'testing-unit-tests',

  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' },
  },
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html', 'json'],
  coverageDirectory: '../../../coverage/libs/testing/unit-tests',
  preset: '../../../jest.preset.ts',
};
