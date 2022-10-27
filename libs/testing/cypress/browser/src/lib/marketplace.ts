import { Movie, Organization } from '@blockframes/model';
import { algolia, firestore, get, getAllStartingWith } from '@blockframes/testing/cypress/browser';

export function syncMovieToAlgolia(movieId: string) {
  return firestore
    .get(`movies/${movieId}`)
    .then((dbMovie: Movie) => {
      firestore
        .queryData({ collection: 'orgs', field: 'id', operator: 'in', value: dbMovie.orgIds })
        .then((orgs: Organization[]) => {
          const organizationNames = orgs.map(org => org.name);
          algolia.storeMovie({ movie: dbMovie, organizationNames });
        });
    })
    .then(() => cy.wait(5000)); // i don't like it, but algolia needs some time to catch up
}

export function selectFilter(name: string) {
  return get('filters').contains(name).click();
}

export function selectYear(year: number) {
  const steps = Math.floor((year - 1980) / 10);
  if (steps) return cy.get('body').type('{downArrow}'.repeat(steps));
  return;
}

export function selectToggle(prefix: string, text: string) {
  return getAllStartingWith(prefix).then($elements => {
    const $toggles = $elements.children();
    for (const $toggle of $toggles) {
      if ($toggle.innerText === text) cy.wrap($toggle).click();
    }
  });
}
