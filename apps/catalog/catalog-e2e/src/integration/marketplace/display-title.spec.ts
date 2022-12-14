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
} from '@blockframes/model';
import { formatRunningTime } from '@blockframes/movie/pipes/running-time.pipe';
import { format } from 'date-fns';

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
    algolia.deleteMovie({ app: 'catalog', objectId: movie.id });
    firestore.deleteOrgMovies(org.id);
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
  get('organization').should('contain', movieOrg.name);
}

function checkMain() {
  get('synopsis').should('contain', movie.synopsis);
  get('logline').should('contain', movie.logline);
  get('keywords').should('contain', titleCase(movie.keywords[0])).and('contain', titleCase(movie.keywords[1]));
  get('release').should('contain', movie.release.year).and('contain', screeningStatus[movie.release.status]);
  get('country').should('contain', territories[movie.originCountries[0]]).and('contain', territories[movie.originCountries[1]]);
  get('language').should('contain', languages[movie.originalLanguages[0]]).and('contain', languages[movie.originalLanguages[1]]);
  get('genres').should('contain', genres[movie.genres[0]]).and('contain', genres[movie.genres[1]]);
  get('running-time').should('contain', formatRunningTime(movie.runningTime));
  get('director-card_0')
    .should('contain', `${movie.directors[0].firstName} ${movie.directors[0].lastName}`)
    .and('contain', directorCategory[movie.directors[0].category])
    .and('contain', movie.directors[0].description);
  findIn('director-card_0', `${movie.directors[0].status}-icon`).should('exist');
  get('card-filmography').click();
  get('director-card_0')
    .should('contain', movie.directors[0].filmography[0].title)
    .and('contain', movie.directors[0].filmography[0].year);
  get('prize-card_0')
    .should('contain', festival[movie.prizes[0].name].toUpperCase())
    .and('contain', movie.prizes[0].prize)
    .and('contain', movie.prizes[0].year)
    .and('contain', premiereType[movie.prizes[0].premiere]);
  get('custom-prize-card_0')
    .should('contain', movie.customPrizes[0].name.toUpperCase())
    .and('contain', movie.customPrizes[0].prize)
    .and('contain', movie.customPrizes[0].year)
    .and('contain', premiereType[movie.customPrizes[0].premiere]);
  get('review-card_0').should('contain', movie.review[0].journalName);
  get('review-card_0').should('contain', movie.review[0].criticQuote);
  get('review-card_0').should('contain', movie.review[0].criticName);
  get('review-link').should('have.attr', 'href', movie.review[0].revueLink);
}

function checkArtistic() {
  get('Artistic').click();
  assertUrlIncludes(`c/o/marketplace/title/${movie.id}/artistic`);
  get('cast-card_0')
    .should('contain', `${movie.cast[0].firstName} ${movie.cast[0].lastName}`)
    .and('contain', movie.cast[0].description);
  findIn('cast-card_0', 'card-filmography').click();
  findIn('cast-card_0', `${movie.cast[0].status}-icon`).should('exist');
  get('cast-card_0')
    .should('contain', movie.cast[0].filmography[0].title)
    .and('contain', movie.cast[0].filmography[0].year)
    .and('contain', movie.cast[0].filmography[1].title)
    .and('contain', movie.cast[0].filmography[1].year);
  get('cast-card_1')
    .should('contain', `${movie.cast[1].firstName} ${movie.cast[1].lastName}`)
    .and('contain', movie.cast[1].description);
  findIn('cast-card_1', 'card-filmography').click();
  findIn('cast-card_1', `${movie.cast[1].status}-icon`).should('exist');
  get('cast-card_1')
    .should('contain', movie.cast[1].filmography[0].title)
    .and('contain', movie.cast[1].filmography[0].year)
    .and('contain', movie.cast[1].filmography[1].title)
    .and('contain', movie.cast[1].filmography[1].year);
  get('crew-card_0')
    .should('contain', `${movie.crew[0].firstName} ${movie.crew[0].lastName}`)
    .and('contain', crewRoles[movie.crew[0].role])
    .and('contain', movie.crew[0].description);
  findIn('crew-card_0', 'card-filmography').click();
  findIn('crew-card_0', `${movie.crew[0].status}-icon`).should('exist');
  get('crew-card_0')
    .should('contain', movie.crew[0].filmography[0].title)
    .and('contain', movie.crew[0].filmography[0].year)
    .and('contain', movie.crew[0].filmography[1].title)
    .and('contain', movie.crew[0].filmography[1].year);
  get('crew-card_1')
    .should('contain', `${movie.crew[1].firstName} ${movie.crew[1].lastName}`)
    .and('contain', crewRoles[movie.crew[1].role])
    .and('contain', movie.crew[1].description);
  findIn('crew-card_1', 'card-filmography').click();
  findIn('crew-card_1', `${movie.crew[1].status}-icon`).should('exist');
  get('crew-card_1')
    .should('contain', movie.crew[1].filmography[0].title)
    .and('contain', movie.crew[1].filmography[0].year)
    .and('contain', movie.crew[1].filmography[1].title)
    .and('contain', movie.crew[1].filmography[1].year);
}

function checkProduction() {
  get('Production').click();
  assertUrlIncludes(`c/o/marketplace/title/${movie.id}/production`);
  get('prod-company_0')
    .should('contain', territories[movie.stakeholders.productionCompany[0].countries[0]])
    .and('contain', territories[movie.stakeholders.productionCompany[0].countries[1]])
    .and('contain', movie.stakeholders.productionCompany[0].displayName);
  get('prod-company_1')
    .should('contain', territories[movie.stakeholders.productionCompany[1].countries[0]])
    .and('contain', territories[movie.stakeholders.productionCompany[1].countries[1]])
    .and('contain', movie.stakeholders.productionCompany[1].displayName);
  get('co-prod-company_0')
    .should('contain', territories[movie.stakeholders.coProductionCompany[0].countries[0]])
    .and('contain', movie.stakeholders.coProductionCompany[0].displayName);
  get('producer_0')
    .should('contain', producerRoles[movie.producers[0].role])
    .and('contain', `${movie.producers[0].firstName} ${movie.producers[0].lastName}`);
  get('producer_1')
    .should('contain', producerRoles[movie.producers[1].role])
    .and('contain', `${movie.producers[1].firstName} ${movie.producers[1].lastName}`);
  get('distributor_0')
    .should('contain', movie.stakeholders.distributor[0].displayName)
    .and('contain', territories[movie.stakeholders.distributor[0].countries[0]]);
  get('international-sales_0')
    .should('contain', movie.stakeholders.salesAgent[0].displayName)
    .and('contain', territories[movie.stakeholders.salesAgent[0].countries[0]]);
}

function checkAdditional() {
  get('Additional').click();
  assertUrlIncludes(`c/o/marketplace/title/${movie.id}/additional`);
  get('release_0')
    .should('contain', territories[movie.originalRelease[0].country])
    .and('contain', releaseMedias[movie.originalRelease[0].media])
    .and('contain', format(movie.originalRelease[0].date, 'M/d/yy'));
  get('box-office_0')
    .should('contain', territories[movie.boxOffice[0].territory])
    .and(
      'contain',
      movie.boxOffice[0].value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'EUR',
      })
    );
  get('ratings_0').should('contain', territories[movie.rating[0].country]).and('contain', movie.rating[0].value);
  get('budget-range').should('contain', budgetRange[movie.estimatedBudget]);
  get('qualifications')
    .should('contain', certifications[movie.certifications[0]])
    .and('contain', certifications[movie.certifications[1]]);
  get('format').should('contain', movieFormat[movie.format]);
  get('quality').should('contain', movieFormatQuality[movie.formatQuality]);
  get('color').should('contain', colors[movie.color]);
  get('sound').should('contain', soundFormat[movie.soundFormat]);
  get('original-version').should('contain', languages[movie.originalLanguages[0]]);
  get('languages_0').should('contain', languages[Object.keys(movie.languages)[0]]).and('contain', movieLanguageTypes['dubbed']);
  get('target').should('contain', movie.audience.targets[0]).and('contain', movie.audience.targets[1]);
  get('social').should('contain', socialGoals[movie.audience.goals[0]]).and('contain', socialGoals[movie.audience.goals[1]]);
}
