module.exports = {
  name: 'testing',
  preset: '../../jest.config.js',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  //Note: testEnvironment may not be appropriate for some app tests
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html', 'json'],
  coverageDirectory: '../../coverage/libs/testing',
  globals: { 'ts-jest': { tsConfig: '<rootDir>/tsconfig.spec.json' } },
};
