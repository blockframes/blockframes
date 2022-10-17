import { Movie } from '@blockframes/model';
import { algolia, firestore, get, getAllStartingWith } from '@blockframes/testing/cypress/browser';

export function movieCardShould(option: 'exist' | 'not.exist', title: string) {
  let titleFound = false;
  return getAllStartingWith('item_').then($elements => {
    const $cards = $elements.children();
    const cardsInnerTexts = $cards.toArray().map(child => child.innerText);
    for (const text of cardsInnerTexts) {
      if (text.includes(title)) titleFound = true;
    }
    if (option === 'exist') {
      expect(titleFound).to.equal(true);
    } else {
      expect(titleFound).to.equal(false);
    }
  });
}

export function syncMovieToAlgolia(movieId: string) {
  return firestore
    .get(`movies/${movieId}`)
    .then((dbMovie: Movie) => algolia.storeMovie({ movie: dbMovie, organizationNames: dbMovie.orgIds }));
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
