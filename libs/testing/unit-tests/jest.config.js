﻿module.exports = {
  name: 'testing-unit-tests',
  preset: '../../../jest.preset.js',
  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' },
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html', 'json'],
  coverageDirectory: '../../../coverage/libs/testing/unit-tests',
};
