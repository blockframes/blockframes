import { Contract, Notification, Organization } from '@blockframes/model';
import { QueryParameters, UpdateParameters } from '../../../commons';

export const firestore = {
  clearTestData() {
    return cy.task('clearTestData');
  },

  create(data: Record<string, object>[]) {
    return cy.task('importData', data);
  },

  delete(paths: string[] | string) {
    if (Array.isArray(paths)) return cy.task('deleteData', paths);
    return cy.task('deleteData', [paths]);
  },

  get<T>(paths: string[] | string): Cypress.Chainable<T | T[]> {
    if (Array.isArray(paths)) return cy.task('getData', paths);
    return cy.task('getData', [paths]).then(array => array[0]);
  },

  queryData<T>(data: QueryParameters): Cypress.Chainable<T[]> {
    return cy.task('queryData', data);
  },

  queryDelete<T>(data: QueryParameters): Cypress.Chainable<T[]> {
    return cy.task('queryDelete', data);
  },

  update(data: UpdateParameters[] | UpdateParameters) {
    if (Array.isArray(data)) return cy.task('updateData', data);
    return cy.task('updateData', [data]);
  },

  deleteContractsAndTerms(orgId: string) {
    return firestore
      .queryDelete<Contract>({ collection: 'contracts', field: 'sellerId', operator: '==', value: orgId })
      .then(contracts => {
        const termIds = Array.from(new Set(contracts.map(contract => contract.termIds).flat()));
        const termPaths = termIds.map(termId => `terms/${termId}`);
        return firestore.delete(termPaths);
      });
  },

  deleteNotifications(userIds: string | string[]) {
    if (!Array.isArray(userIds)) userIds = [userIds];
    const promises = userIds.map(userId =>
      firestore.queryDelete<Notification>({ collection: 'notifications', field: 'toUserId', operator: '==', value: userId })
    );
    return Promise.all(promises);
  },

  queryDeleteOrgsWithUsers(data: QueryParameters) {
    return firestore.queryDelete<Organization>(data).then(orgs => {
      const promises = [];
      for (const org of orgs) {
        promises.push(firestore.delete(`permissions/${org.id}`));
        for (const uid of org.userIds) promises.push(firestore.delete(`users/${uid}`));
      }
      return Promise.all(promises);
    });
  },
};
