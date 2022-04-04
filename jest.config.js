const { getJestProjects } = require('@nrwl/jest');

module.exports = {
  projects: [...getJestProjects(), '<rootDir>/apps/festival', '<rootDir>/apps/libs', '<rootDir>/libs/testing/cypress'],
};
