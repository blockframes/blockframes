import { WhereFilterOp } from 'firebase/firestore';

export const firestore = {
  clearTestData() {
    return cy.task('clearTestData');
  },

  create(data: Record<string, object>[]) {
    return cy.task('importData', data);
  },

  delete(paths: string[]) {
    return cy.task('deleteData', paths);
  },

  get(paths: string[]) {
    return cy.task('getData', paths);
  },

  queryData(data: { collection: string; field: string; operator: WhereFilterOp; value: unknown }) {
    return cy.task('queryData', data);
  },

  update(data: { docPath: string; field: string; value: unknown }[]) {
    return cy.task('updateData', data);
  },
};
