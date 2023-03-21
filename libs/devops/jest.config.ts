module.exports = {
  displayName: 'devops',

  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testEnvironment: 'node',
  coverageDirectory: '../../coverage/libs/devops',
  preset: '../../jest.preset.ts',
};
