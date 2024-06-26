﻿const nxPreset = require('@nx/jest/preset');

module.exports = {
  ...nxPreset,
  testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
  transform: {
    '^.+\\.(ts|js|html)$': 'ts-jest',
  },
  testEnvironment: 'jest-environment-jsdom',
  resolver: '@nx/jest/plugins/resolver',
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageReporters: ['html'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        uniqueOutputName: 'true',
        outputDirectory: 'dist/jest-test-results/',
      },
    ],
  ],
};
