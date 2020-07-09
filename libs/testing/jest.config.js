module.exports = {
  name: 'testing',
  preset: '../../jest.config.js',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest'
  },
  //Note: testEnvironment may not be appropriate for some app tests
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html', 'json'],
  testPathIgnorePatterns: [
    'node_modules/'
  ],
  coverageDirectory: '../../coverage/libs/testing'
};
