import { WhereFilterOp } from 'firebase/firestore';
import { Contract, Notification } from '@blockframes/model';

interface UpdateParameters {
  docPath: string;
  field: string;
  value: unknown;
}

interface QueryParameters {
  collection: string;
  field: string;
  operator: WhereFilterOp;
  value: unknown;
}

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

  get(paths: string[] | string) {
    if (Array.isArray(paths)) return cy.task('getData', paths);
    return cy.task('getData', [paths]).then(array => array[0]);
  },

  queryData(data: QueryParameters) {
    return cy.task('queryData', data);
  },

  queryDelete(data: QueryParameters) {
    return cy.task('queryDelete', data);
  },

  update(data: UpdateParameters[] | UpdateParameters) {
    if (Array.isArray(data)) return cy.task('updateData', data);
    return cy.task('updateData', [data]);
  },

  deleteContractsAndTerms(orgId: string) {
    return firestore
      .queryDelete({ collection: 'contracts', field: 'sellerId', operator: '==', value: orgId })
      .then((contracts: Contract[]) => {
        const termIds = contracts.map(contract => contract.termIds).flat();
        const termPaths = termIds.map(termId => `terms/${termId}`);
        return firestore.delete(termPaths);
      });
  },

  deleteNotifications(userIds: string | string[]) {
    if (!Array.isArray(userIds)) userIds = [userIds];
    const promises = [];
    for (const userId of userIds) {
      firestore
        .queryData({ collection: 'notifications', field: 'toUserId', operator: '==', value: userId })
        .then((notifications: Notification[]) => {
          for (const notification of notifications) {
            promises.push(firestore.delete(`notifications/${notification.id}`));
          }
        });
    }
    return Promise.all(promises);
  },
};
