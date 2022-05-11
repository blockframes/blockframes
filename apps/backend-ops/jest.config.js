module.exports = {
  name: 'backend-ops',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' },
  },
  transform: {
    '^.+\\.(ts)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  testEnvironment: 'node',
  coverageDirectory: '../../coverage/apps/backend-ops',
};
