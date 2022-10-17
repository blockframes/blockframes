import { WhereFilterOp } from 'firebase/firestore';
import { Event, Movie } from '@blockframes/model';

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
      .then((movies: Movie[]) => {
        for (const movie of movies) firestore.delete(`movies/${movie.id}`);
      });
  },
};

interface UpdateParameters {
  docPath: string;
  field: string;
  value: unknown;
}
