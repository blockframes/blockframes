import {
  user,
  org,
  movieOrg,
  orgPermissions,
  movieOrgPermissions,
  movieOrgMoviePermissions,
  displayMovie as movie,
} from '../../fixtures/marketplace/search-display-title';
import {
  // plugins
  adminAuth,
  algolia,
  browserAuth,
  firestore,
  maintenance,
  // cypress commands
  assertUrlIncludes,
  get,
  findIn,
  // marketplace lib
  syncMovieToAlgolia,
  // helpers
  titleCase,
  assertMultipleTexts,
  assertLocalStorage,
} from '@blockframes/testing/cypress/browser';
import {
  budgetRange,
  certifications,
  colors,
  contentType,
  crewRoles,
  directorCategory,
  festival,
  genres,
  languages,
  movieFormat,
  movieFormatQuality,
  movieLanguageTypes,
  productionStatus,
  screeningStatus,
  territories,
  territoriesISOA2,
  premiereType,
  producerRoles,
  releaseMedias,
  socialGoals,
  soundFormat,
  IAlgoliaKeyDoc,
} from '@blockframes/model';
import { formatRunningTime } from '@blockframes/movie/pipes/running-time.pipe';
import { format } from 'date-fns';
import { algoliaSearchKeyDoc } from '@blockframes/utils/maintenance';

const injectedData = {
  [`users/${user.uid}`]: user,
  [`orgs/${org.id}`]: org,
  [`orgs/${movieOrg.id}`]: movieOrg,
  [`permissions/${orgPermissions.id}`]: orgPermissions,
  [`permissions/${movieOrgPermissions.id}`]: movieOrgPermissions,
  [`permissions/${movieOrgPermissions.id}/documentPermissions/${movieOrgMoviePermissions.id}`]: movieOrgMoviePermissions,
  [`movies/${movie.id}`]: movie,
};

describe('Movie display in marketplace', () => {
  beforeEach(() => {
    cy.visit('');
    maintenance.start();
    firestore.clearTestData();
    firestore.queryDelete({ collection: 'movies', field: 'orgIds', operator: 'array-contains', value: org.id });
    algolia.deleteMovie({ app: 'catalog', objectId: movie.id });
    adminAuth.deleteAllTestUsers();
    firestore.create([injectedData]);
    adminAuth.createUser({ uid: user.uid, email: user.email, emailVerified: true });
    maintenance.end();
    browserAuth.clearBrowserAuth();
    cy.visit('');
    browserAuth.signinWithEmailAndPassword(user.email);
    cy.visit('');
    get('skip-preferences').click();
    get('cookies').click();
    assertUrlIncludes('c/o/marketplace/home');
    firestore.get(`${algoliaSearchKeyDoc}`).then((config: IAlgoliaKeyDoc) => {
      assertLocalStorage('algoliaSearchKey', config.key);
    });
  });

  it('Access to title page by clicking on the movie card', () => {
    const titlePage = `/c/o/marketplace/title/${movie.id}`;
    syncMovieToAlgolia(movie.id);
    get('title-link').eq(0).click();
    get('search-input').type(movie.title.international);
    get(`movie-card_${movie.id}`).trigger('mouseenter');
    get(`movie-card_${movie.id}`).find('a').should('have.attr', 'href', titlePage);
    get(`movie-card_${movie.id}`).find('a').click();
    assertUrlIncludes(titlePage + '/main');
  });

  it('Released movie metadata is displayed in the title page', () => {
    cy.visit(`c/o/marketplace/title/${movie.id}/main`);
    checkHeader();
    checkMain();
    checkArtistic();
    checkProduction();
    checkAdditional();
    //check avails
    get('Avails').click();
    assertUrlIncludes(`c/o/marketplace/title/${movie.id}/avails/map`);
  });
});

function checkHeader() {
  get('director').should('contain', `${movie.directors[0].firstName} ${movie.directors[0].lastName}`);
  get('title').should('contain', movie.title.international);
  get('features')
    .should('contain', contentType[movie.contentType])
    .and('contain', genres[movie.genres[0]])
    .and('not.contain', genres[movie.genres[1]])
    .and('contain', formatRunningTime(movie.runningTime))
    .and('contain', territoriesISOA2[movie.originCountries[0]])
    .and('not.contain', territoriesISOA2[movie.originCountries[1]])
    .and('contain', languages[movie.originalLanguages[0]])
    .and('not.contain', languages[movie.originalLanguages[1]])
    .and('contain', productionStatus[movie.productionStatus]);
}

function checkMain() {
  get('synopsis').should('contain', movie.synopsis);
  get('logline').should('contain', movie.logline);
  assertMultipleTexts('keywords', [titleCase(movie.keywords[0]), titleCase(movie.keywords[1])]);
  assertMultipleTexts('release', [movie.release.year.toString(), screeningStatus[movie.release.status]]);
  assertMultipleTexts('country', [territories[movie.originCountries[0]], territories[movie.originCountries[1]]]);
  assertMultipleTexts('language', [languages[movie.originalLanguages[0]], languages[movie.originalLanguages[1]]]);
  assertMultipleTexts('genres', [genres[movie.genres[0]], genres[movie.genres[1]]]);
  get('running-time').should('contain', formatRunningTime(movie.runningTime));
  assertMultipleTexts('director-card_0', [
    `${movie.directors[0].firstName} ${movie.directors[0].lastName}`,
    directorCategory[movie.directors[0].category],
    movie.directors[0].description,
  ]);
  findIn('director-card_0', `${movie.directors[0].status}-icon`).should('exist');
  get('card-filmography').click();
  assertMultipleTexts('director-card_0', [
    movie.directors[0].filmography[0].title,
    movie.directors[0].filmography[0].year.toString(),
  ]);
  assertMultipleTexts('prize-card_0', [
    festival[movie.prizes[0].name].toUpperCase(),
    movie.prizes[0].prize,
    movie.prizes[0].year,
    premiereType[movie.prizes[0].premiere],
  ]);
  assertMultipleTexts('custom-prize-card_0', [
    movie.customPrizes[0].name.toUpperCase(),
    movie.customPrizes[0].prize,
    movie.customPrizes[0].year.toString(),
    premiereType[movie.customPrizes[0].premiere],
  ]);
  get('review-card_0').should('contain', movie.review[0].journalName);
  get('review-card_0').should('contain', movie.review[0].criticQuote);
  get('review-card_0').should('contain', movie.review[0].criticName);
  get('review-link').should('have.attr', 'href', movie.review[0].revueLink);
}

function checkArtistic() {
  get('Artistic').click();
  assertUrlIncludes(`c/o/marketplace/title/${movie.id}/artistic`);
  assertMultipleTexts('cast-card_0', [`${movie.cast[0].firstName} ${movie.cast[0].lastName}`, movie.cast[0].description]);
  findIn('cast-card_0', 'card-filmography').click();
  findIn('cast-card_0', `${movie.cast[0].status}-icon`).should('exist');
  assertMultipleTexts('cast-card_0', [
    movie.cast[0].filmography[0].title,
    movie.cast[0].filmography[0].year.toString(),
    movie.cast[0].filmography[1].title,
    movie.cast[0].filmography[1].year.toString(),
  ]);
  assertMultipleTexts('cast-card_1', [`${movie.cast[1].firstName} ${movie.cast[1].lastName}`, movie.cast[1].description]);
  findIn('cast-card_1', 'card-filmography').click();
  findIn('cast-card_1', `${movie.cast[1].status}-icon`).should('exist');
  assertMultipleTexts('cast-card_1', [
    movie.cast[1].filmography[0].title,
    movie.cast[1].filmography[0].year.toString(),
    movie.cast[1].filmography[1].title,
    movie.cast[1].filmography[1].year.toString(),
  ]);
  assertMultipleTexts('crew-card_0', [
    `${movie.crew[0].firstName} ${movie.crew[0].lastName}`,
    crewRoles[movie.crew[0].role],
    movie.crew[0].description,
  ]);
  findIn('crew-card_0', 'card-filmography').click();
  findIn('crew-card_0', `${movie.crew[0].status}-icon`).should('exist');
  assertMultipleTexts('crew-card_0', [
    movie.crew[0].filmography[0].title,
    movie.crew[0].filmography[0].year.toString(),
    movie.crew[0].filmography[1].title,
    movie.crew[0].filmography[1].year.toString(),
  ]);
  assertMultipleTexts('crew-card_1', [
    `${movie.crew[1].firstName} ${movie.crew[1].lastName}`,
    crewRoles[movie.crew[1].role],
    movie.crew[1].description,
  ]);
  findIn('crew-card_1', 'card-filmography').click();
  findIn('crew-card_1', `${movie.crew[1].status}-icon`).should('exist');
  assertMultipleTexts('crew-card_1', [
    movie.crew[1].filmography[0].title,
    movie.crew[1].filmography[0].year.toString(),
    movie.crew[1].filmography[1].title,
    movie.crew[1].filmography[1].year.toString(),
  ]);
}

function checkProduction() {
  get('Production').click();
  assertUrlIncludes(`c/o/marketplace/title/${movie.id}/production`);
  assertMultipleTexts('prod-company_0', [
    territories[movie.stakeholders.productionCompany[0].countries[0]],
    territories[movie.stakeholders.productionCompany[0].countries[1]],
    movie.stakeholders.productionCompany[0].displayName,
  ]);
  assertMultipleTexts('prod-company_1', [
    territories[movie.stakeholders.productionCompany[1].countries[0]],
    territories[movie.stakeholders.productionCompany[1].countries[1]],
    movie.stakeholders.productionCompany[1].displayName,
  ]);
  assertMultipleTexts('co-prod-company_0', [
    territories[movie.stakeholders.coProductionCompany[0].countries[0]],
    movie.stakeholders.coProductionCompany[0].displayName,
  ]);
  assertMultipleTexts('producer_0', [
    producerRoles[movie.producers[0].role],
    `${movie.producers[0].firstName} ${movie.producers[0].lastName}`,
  ]);
  assertMultipleTexts('producer_1', [
    producerRoles[movie.producers[1].role],
    `${movie.producers[1].firstName} ${movie.producers[1].lastName}`,
  ]);
  assertMultipleTexts('distributor_0', [
    movie.stakeholders.distributor[0].displayName,
    territories[movie.stakeholders.distributor[0].countries[0]],
  ]);
  assertMultipleTexts('international-sales_0', [
    movie.stakeholders.salesAgent[0].displayName,
    territories[movie.stakeholders.salesAgent[0].countries[0]],
  ]);
}

function checkAdditional() {
  get('Additional').click();
  assertUrlIncludes(`c/o/marketplace/title/${movie.id}/additional`);
  assertMultipleTexts('release_0', [
    territories[movie.originalRelease[0].country],
    releaseMedias[movie.originalRelease[0].media],
    format(movie.originalRelease[0].date, 'M/d/yy'),
  ]);
  assertMultipleTexts('box-office_0', [
    territories[movie.boxOffice[0].territory],
    movie.boxOffice[0].value.toLocaleString('en-US', { style: 'currency', currency: 'EUR' }),
  ]);
  assertMultipleTexts('ratings_0', [territories[movie.rating[0].country], movie.rating[0].value]);
  get('budget-range').should('contain', budgetRange[movie.estimatedBudget]);
  assertMultipleTexts('qualifications', [certifications[movie.certifications[0]], certifications[movie.certifications[1]]]);
  get('format').should('contain', movieFormat[movie.format]);
  get('quality').should('contain', movieFormatQuality[movie.formatQuality]);
  get('color').should('contain', colors[movie.color]);
  get('sound').should('contain', soundFormat[movie.soundFormat]);
  get('original-version').should('contain', languages[movie.originalLanguages[0]]);
  assertMultipleTexts('languages_0', [languages[Object.keys(movie.languages)[0]], movieLanguageTypes['dubbed']]);
  assertMultipleTexts('target', [movie.audience.targets[0], movie.audience.targets[1]]);
  assertMultipleTexts('social', [socialGoals[movie.audience.goals[0]], socialGoals[movie.audience.goals[1]]]);
}
