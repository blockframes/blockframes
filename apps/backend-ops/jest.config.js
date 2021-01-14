module.exports = {
  name: 'backend-ops',
  preset: '../../jest.preset.js',
  coverageDirectory: '../../coverage/apps/backend-ops',
  globals: { 'ts-jest': { tsConfig: '<rootDir>/tsconfig.spec.json' } },
  testEnvironment: 'node',
};
