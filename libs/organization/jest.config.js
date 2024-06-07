module.exports = {
  preset: '../../jest.preset.js',
  transform: {
    '^.+.(ts|mjs|js|html)$': 'jest-preset-angular'
  },
  transformIgnorePatterns: ['node_modules/(?!.*.mjs$)'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/organization',
};
