export const storage = {
  exists(path:  string) {
    return cy.task('fileExists', path);
  },
};
