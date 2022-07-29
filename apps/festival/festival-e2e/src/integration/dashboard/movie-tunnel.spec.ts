import {
  // plugins
  adminAuth,
  browserAuth,
  firestore,
  maintenance,
  // cypress commands
  get,
  findIn,
  getInList,
  getAllStartingWith,
} from '@blockframes/testing/cypress/browser';
import {
  Movie,
  genres,
  languages,
  territories,
  memberStatus,
  screeningStatus,
  directorCategory,
  productionStatus,
  ProductionStatus,
  producerRoles,
} from '@blockframes/model';
import { user, org, permissions, inDevelopmentMovie } from '../../fixtures/dashboard/movie-tunnel';

const injectedData = {
  [`users/${user.uid}`]: user,
  [`orgs/${org.id}`]: org,
  [`permissions/${permissions.id}`]: permissions,
};

describe('Movie tunnel', () => {
  beforeEach(() => {
    cy.visit('');
    maintenance.start();
    firestore.clearTestData();
    firestore
      .queryData({ collection: 'movies', field: 'orgIds', operator: 'array-contains', value: org.id })
      .then((movies: Movie[]) => {
        for (const movie of movies) firestore.delete([`movies/${movie.id}`]);
      });
    adminAuth.deleteAllTestUsers();
    firestore.create([injectedData]);
    adminAuth.createUser({ uid: user.uid, email: user.email, emailVerified: true });
    maintenance.end();
    browserAuth.clearBrowserAuth();
    cy.visit('');
    browserAuth.signinWithEmailAndPassword(user.email);
    cy.visit('');
    get('title').click();
    get('cookies').click();
  });

  it('Create a movie in development', () => {
    const movie = inDevelopmentMovie;
    //dashboard
    get('no-title').should('exist');
    get('add-title').click();
    //loby
    get('start').click();
    //title status
    get('status_0').should('contain', productionStatus[movie.productionStatus]).click();
    get('next').click();

    //main
    checkSideNav(movie.productionStatus);
    get('international-title').type(movie.title.original);
    get('original-title').type(movie.title.original);
    get('reference').type('test');
    ///checking movie related fields (default)
    get('content-type').should('contain', 'Movie');
    get('run-time').type(movie.runningTime.time.toString());
    get('screening-status').click();
    getAllStartingWith('option_').then($options => {
      for (const status of Object.values(screeningStatus)) {
        cy.wrap($options).should('contain', status);
      }
    });
    getInList('option_', screeningStatus[movie.runningTime.status]);
    get('season-count').should('not.exist');
    get('episode-count').should('not.exist');
    ///checking TV related fields
    get('content-type').click();
    getInList('option_', 'TV');
    get('season-count').type('5');
    get('episode-count').type('20');
    ///back to movie type
    get('content-type').click();
    getInList('option_', 'Movie');
    ///general information
    get('release-year').type(movie.release.year.toString());
    get('status').click();
    getAllStartingWith('option_').then($options => {
      for (const status of ['Estimated', 'Confirmed']) {
        cy.wrap($options).should('contain', status);
      }
    });
    getInList('option_', screeningStatus[movie.release.status]);
    get('country').children().eq(0).click();
    cy.get('[role="listbox"]')
      .children()
      .each($child => {
        if ($child.text().includes(territories[movie.originCountries[0]])) {
          cy.wrap($child).click(); //adding country within all options
        }
      });
    get('country').find('input').type(`${movie.originCountries[1]}{enter}{esc}`); //writing it entirely
    get('language').children().eq(0).click();
    cy.get('[role="listbox"]')
      .children()
      .each($child => {
        if ($child.text().includes(languages[movie.originalLanguages[0]])) {
          cy.wrap($child).click();
        }
      });
    get('language').find('input').type(`${movie.originalLanguages[1]}{enter}{esc}`);
    get('genres').children().eq(0).click();
    cy.get('[role="listbox"]')
      .children()
      .each($child => {
        if ($child.text().includes(genres[movie.genres[0]])) {
          cy.wrap($child).click();
        }
      });
    get('genres').find('input').type(`${movie.genres[1]}{enter}{esc}`);
    ///directors
    get('table-save').should('be.disabled');
    get('first-name').type(movie.directors[0].firstName);
    get('last-name').type(movie.directors[0].lastName);
    get('director-status').click();
    getInList('option_', memberStatus[movie.directors[0].status]);
    get('director-category').click();
    getInList('option_', directorCategory[movie.directors[0].category]);
    get('director-desc').type(movie.directors[0].description);
    get('director-film-title').eq(0).type(movie.directors[0].filmography[0].title);
    get('director-film-year').eq(0).type(movie.directors[0].filmography[0].year.toString());
    get('table-save').click();
    get('next').click();

    //storyline elements
    get('logline').type(movie.logline);
    get('synopsis').type(movie.synopsis);
    get('key-assets').type(movie.keyAssets);
    get('keyword').type(`${movie.keywords[0]}{enter}${movie.keywords[1]}{enter}`);
    get('next').click();

    //production informations
    ///production company
    get('production-company-name').type(movie.stakeholders.productionCompany[0].displayName);
    get('production-country').click();
    cy.get('[role="listbox"]')
      .children()
      .each($child => {
        if ($child.text().includes(territories[movie.stakeholders.productionCompany[0].countries[0]])) {
          cy.wrap($child).click();
        }
      });
    get('production-country').find('input').type(`${movie.stakeholders.productionCompany[0].countries[1]}{enter}{esc}`);
    findIn('company', 'row-save').click();
    findIn('company', 'list-add').click();
    get('production-company-name').type(movie.stakeholders.productionCompany[1].displayName);
    get('production-country').click();
    cy.get('[role="listbox"]')
      .children()
      .each($child => {
        if ($child.text().includes(territories[movie.stakeholders.productionCompany[1].countries[0]])) {
          cy.wrap($child).click();
        }
      });
    get('production-country').find('input').type(`${movie.stakeholders.productionCompany[1].countries[1]}{enter}{esc}`);
    findIn('company', 'row-save').click();
    ///co-production company
    get('co-production-company-name').type(movie.stakeholders.coProductionCompany[0].displayName);
    get('co-production-country').click();
    cy.get('[role="listbox"]')
      .children()
      .each($child => {
        if ($child.text().includes(territories[movie.stakeholders.coProductionCompany[0].countries[0]])) {
          cy.wrap($child).click();
        }
      });
    get('co-production-country').find('input').type(`${movie.stakeholders.coProductionCompany[0].countries[1]}{enter}{esc}`);
    findIn('co-company', 'row-save').click();
    ///producers
    get('first-name').type(movie.producers[0].firstName);
    get('last-name').type(movie.producers[0].lastName);
    get('producer-role').click();
    getInList('option_', producerRoles[movie.producers[0].role]);
    findIn('producers', 'row-save').click();
    findIn('producers', 'list-add').click();
    get('first-name').type(movie.producers[1].firstName);
    get('last-name').type(movie.producers[1].lastName);
    get('producer-role').click();
    getInList('option_', producerRoles[movie.producers[1].role]);
    findIn('producers', 'row-save').click();
    ///distributors
    get('distribution-company-name').type(movie.stakeholders.distributor[0].displayName);
    get('distribution-country').click();
    cy.get('[role="listbox"]')
      .children()
      .each($child => {
        if ($child.text().includes(territories[movie.stakeholders.distributor[0].countries[0]])) {
          cy.wrap($child).click();
        }
      });
    findIn('distributors', 'row-save').click();
    ///sales
    get('sales-company-name').type(movie.stakeholders.salesAgent[0].displayName);
    get('sales-country').click();
    cy.get('[role="listbox"]')
      .children()
      .each($child => {
        if ($child.text().includes(territories[movie.stakeholders.salesAgent[0].countries[0]])) {
          cy.wrap($child).click();
        }
      });
    findIn('sales', 'row-save').click();
    get('next').click();

    //artistic team
  });
});

function checkSideNav(status: ProductionStatus) {
  get('steps-list')
    .should('contain', 'First Step')
    .and('contain', 'Title Information')
    .and('contain', 'Main Information')
    .and('contain', 'Storyline Elements')
    .and('contain', 'Production Information')
    .and('contain', 'Artistic Team')
    .and('contain', 'Additional Information')
    .and('contain', 'Technical Specification')
    .and('contain', 'Promotional Elements')
    .and('contain', 'Files')
    .and('contain', 'Images')
    .and('contain', 'Videos')
    .and('contain', 'Screener')
    .and('contain', 'Last Step');
  if (status !== 'development') get('steps-list').should('contain', 'Versions');
  if (status !== 'development' && 'shooting') get('steps-list').should('contain', 'Selections & Reviews');
  if (status !== 'post_production' && 'finished' && 'released') get('steps-list').should('contain', 'Notes & Statements');
  if (status !== 'released') get('steps-list').should('contain', 'Shooting Information');
}