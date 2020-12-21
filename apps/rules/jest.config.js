module.exports = {
  name: 'rules',
  preset: '../../jest.config.js',
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.spec.json',
    }
  },
  coverageDirectory: '../../coverage/apps/rules',
  testEnvironment: 'node',
};