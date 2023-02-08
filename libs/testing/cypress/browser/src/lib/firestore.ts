import { WhereFilterOp } from 'firebase/firestore';
import { Contract, Event, Movie, Offer, Notification, Organization } from '@blockframes/model';

interface UpdateParameters {
  docPath: string;
  field: string;
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

  queryData<T>(data: { collection: string; field: string; operator: WhereFilterOp; value: unknown }): Cypress.Chainable<T> {
    return cy.task('queryData', data);
  },

  update(data: UpdateParameters[] | UpdateParameters) {
    if (Array.isArray(data)) return cy.task('updateData', data);
    return cy.task('updateData', [data]);
  },

  deleteOrgEvents(orgId: string) {
    return firestore
      .queryData<Event[]>({ collection: 'events', field: 'ownerOrgId', operator: '==', value: orgId })
      .then(events => firestore.delete(events.map(event => `events/${event.id}`)));
  },

  deleteOrgMovies(orgId: string) {
    return firestore
      .queryData<Movie[]>({ collection: 'movies', field: 'orgIds', operator: 'array-contains', value: orgId })
      .then(movies => Promise.all(movies.map(movie => firestore.delete(`movies/${movie.id}`))));
  },

  deleteContractsAndTerms(orgId: string) {
    return firestore
      .queryData<Contract[]>({ collection: 'contracts', field: 'sellerId', operator: '==', value: orgId })
      .then(contracts => {
        const promises = [];
        for (const contract of contracts) {
          promises.push(firestore.delete(`contracts/${contract.id}`));
          for (const termId of contract.termIds) promises.push(firestore.delete(`terms/${termId}`));
        }
        return Promise.all(promises);
      });
  },

  deleteBuyerContracts(orgId: string) {
    return firestore
      .queryData<Contract[]>({ collection: 'contracts', field: 'buyerId', operator: '==', value: orgId })
      .then(contracts => {
        const promises = [];
        for (const contract of contracts) {
          promises.push(firestore.delete(`contracts/${contract.id}`));
        }
        return Promise.all(promises);
      });
  },

  deleteOffers(orgId: string) {
    return firestore
      .queryData<Offer[]>({ collection: 'offers', field: 'buyerId', operator: '==', value: orgId })
      .then(offers => firestore.delete(offers.map(({ id }) => `offers/${id}`)));
  },

  deleteNotifications(userIds: string | string[]) {
    if (!Array.isArray(userIds)) userIds = [userIds];
    if (userIds.length > 10) throw new Error('deleteNotifications() cannot receice an array with more than 10 userIds');
    return firestore
      .queryData<Notification[]>({ collection: 'notifications', field: 'toUserId', operator: 'in', value: userIds })
      .then(notifications => {
        const promises = [];
        for (const notification of notifications) {
          promises.push(firestore.delete(`notifications/${notification.id}`));
        }
        return Promise.all(promises);
      });
  },

  queryDeleteOrgsWithUsers(data: { collection: string; field: string; operator: WhereFilterOp; value: string }) {
    return firestore.queryData(data).then((orgs: Organization[]) => {
      const promises = [];
      for (const org of orgs) {
        promises.push(firestore.delete(`orgs/${org.id}`));
        promises.push(firestore.delete(`permissions/${org.id}`));
        org.userIds.forEach(uid => promises.push(firestore.delete(`users/${uid}`)));
      }
      return Promise.all(promises);
    });
  },
};
