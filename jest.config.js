module.exports = {
  globals: {
    'ts-jest': {
      tsConfig: './tsconfig.spec.json',
      stringifyContentPathRegex: '\\.html$',
      astTransformers: [
        'jest-preset-angular/build/InlineFilesTransformer',
        'jest-preset-angular/build/StripStylesTransformer'
      ]
    }
  },
  setupFilesAfterEnv: ['./test-setup.ts'],
  resolver: '@nrwl/jest/plugins/resolver',
  verbose: true,
  transform: {
    '^.+\\.(ts|js|html)$': 'ts-jest'
  },
  testEnvironment: 'jest-environment-jsdom-thirteen',
  moduleFileExtensions: ['ts', 'html', 'js', 'json'],
  transformIgnorePatterns: ['node_modules/(?!@ngrx)'],
  snapshotSerializers: [
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
