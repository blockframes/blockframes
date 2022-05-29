export const firestore = {
  clearTestData() {
    return cy.task('clearTestData');
  },

  delete(paths: string[]) {
    return cy.task('deleteData', paths);
  },

  get(paths: string[]) {
    return cy.task('getData', paths);
  },

  create(data: Record<string, object>[]) {
    return cy.task('importData', data);
  },

  update(data: { docPath: string; field: string; value: unknown }[]) {
    return cy.task('updateData', data);
  },
};