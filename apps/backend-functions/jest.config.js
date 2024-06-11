module.exports = {
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.(ts|html)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  testEnvironment: 'node',
  coverageDirectory: '../../coverage/apps/backend-functions',
};
