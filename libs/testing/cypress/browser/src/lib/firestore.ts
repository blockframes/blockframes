import { WhereFilterOp } from 'firebase/firestore';
import { Contract, Event, Movie, Offer, Notification } from '@blockframes/model';

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

  queryData(data: { collection: string; field: string; operator: WhereFilterOp; value: unknown }) {
    return cy.task('queryData', data);
  },

  update(data: UpdateParameters[] | UpdateParameters) {
    if (Array.isArray(data)) return cy.task('updateData', data);
    return cy.task('updateData', [data]);
  },

  deleteOrgEvents(orgId: string) {
    return firestore
      .queryData({ collection: 'events', field: 'ownerOrgId', operator: '==', value: orgId })
      .then((events: Event[]) => firestore.delete(events.map(event => `events/${event.id}`)));
  },

  deleteOrgMovies(orgId: string) {
    return firestore
      .queryData({ collection: 'movies', field: 'orgIds', operator: 'array-contains', value: orgId })
      .then((movies: Movie[]) => Promise.all(movies.map(movie => firestore.delete(`movies/${movie.id}`))));
  },

  deleteContractsAndTerms(orgId: string) {
    return firestore
      .queryData({ collection: 'contracts', field: 'sellerId', operator: '==', value: orgId })
      .then((contracts: Contract[]) => {
        const promises = [];
        for (const contract of contracts) {
          promises.push(firestore.delete(`contracts/${contract.id}`));
          for (const termId of contract.termIds) promises.push(firestore.delete(`terms/${termId}`));
        }
        return Promise.all(promises);
      });
  },

  deleteOffers(orgId: string) {
    return firestore
      .queryData({ collection: 'offers', field: 'buyerId', operator: '==', value: orgId })
      .then((offers: Offer[]) => firestore.delete(offers.map(({ id }) => `offers/${id}`)));
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
