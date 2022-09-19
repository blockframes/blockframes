import {
  // plugins
  adminAuth,
  browserAuth,
  firestore,
  maintenance,
  // cypress commands
  check,
  uncheck,
  get,
  findIn,
  getInList,
  getInListbox,
  getAllStartingWith,
  assertUrlIncludes
} from '@blockframes/testing/cypress/browser';
import {
  crewRoles,
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
  budgetRange,
  socialGoals,
  shootingPeriod,
  movieFormat,
  movieFormatQuality,
  colors,
  soundFormat,
  hostedVideoTypes,
} from '@blockframes/model';
import { user, org, permissions, inDevelopmentMovie } from '../../fixtures/dashboard/movie-tunnel';
import { addDays, subDays, format } from 'date-fns';

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
    get('reference').type(movie.internalRef);
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
    getInListbox(territories[movie.originCountries[0]]);
    get('country').find('input').type(`${movie.originCountries[1]}{enter}{esc}`); //writing it entirely
    get('language').children().eq(0).click();
    getInListbox(languages[movie.originalLanguages[0]]);
    get('language').find('input').type(`${movie.originalLanguages[1]}{enter}{esc}`);
    get('genres').children().eq(0).click();
    getInListbox(genres[movie.genres[0]]);
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
    getInListbox(territories[movie.stakeholders.productionCompany[0].countries[0]]);
    get('production-country').find('input').type(`${movie.stakeholders.productionCompany[0].countries[1]}{enter}{esc}`);
    findIn('company', 'row-save').click();
    findIn('company', 'list-add').click();
    get('production-company-name').type(movie.stakeholders.productionCompany[1].displayName);
    get('production-country').click();
    getInListbox(territories[movie.stakeholders.productionCompany[1].countries[0]]);
    get('production-country').find('input').type(`${movie.stakeholders.productionCompany[1].countries[1]}{enter}{esc}`);
    findIn('company', 'row-save').click();
    ///co-production company
    get('co-production-company-name').type(movie.stakeholders.coProductionCompany[0].displayName);
    get('co-production-country').click();
    getInListbox(territories[movie.stakeholders.coProductionCompany[0].countries[0]]);
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
    getInListbox(territories[movie.stakeholders.distributor[0].countries[0]]);
    findIn('distributors', 'row-save').click();
    ///sales
    get('sales-company-name').type(movie.stakeholders.salesAgent[0].displayName);
    get('sales-country').click();
    getInListbox(territories[movie.stakeholders.salesAgent[0].countries[0]]);
    findIn('sales', 'row-save').click();
    get('next').click();

    //artistic team
    ///cast member
    get('cast-first-name').type(movie.cast[0].firstName);
    get('cast-last-name').type(movie.cast[0].lastName);
    get('cast-status').click();
    getInListbox(memberStatus[movie.cast[0].status]);
    get('cast-description').type(movie.cast[0].description);
    get('cast-film-title_0').type(movie.cast[0].filmography[0].title);
    get('cast-film-year_0').type(movie.cast[0].filmography[0].year.toString());
    get('cast-film-title_1').type(movie.cast[0].filmography[1].title);
    get('cast-film-year_1').type(movie.cast[0].filmography[1].year.toString());
    findIn('cast-member', 'table-save').click();
    findIn('cast-member', 'add').click();
    get('cast-first-name').type(movie.cast[1].firstName);
    get('cast-last-name').type(movie.cast[1].lastName);
    get('cast-status').click();
    getInListbox(memberStatus[movie.cast[1].status]);
    get('cast-description').type(movie.cast[1].description);
    get('cast-film-title_0').type(movie.cast[1].filmography[0].title);
    get('cast-film-year_0').type(movie.cast[1].filmography[0].year.toString());
    get('cast-film-title_1').type(movie.cast[1].filmography[1].title);
    get('cast-film-year_1').type(movie.cast[1].filmography[1].year.toString());
    findIn('cast-member', 'row-save').click();
    ///crew member
    get('crew-first-name').type(movie.crew[0].firstName);
    get('crew-last-name').type(movie.crew[0].lastName);
    get('crew-role').click();
    getInListbox(crewRoles[movie.crew[0].role]);
    get('crew-status').click();
    getInListbox(memberStatus[movie.crew[0].status]);
    get('crew-description').type(movie.crew[0].description);
    get('crew-film-title_0').type(movie.crew[0].filmography[0].title);
    get('crew-film-year_0').type(movie.crew[0].filmography[0].year.toString());
    get('crew-film-title_1').type(movie.crew[0].filmography[1].title);
    get('crew-film-year_1').type(movie.crew[0].filmography[1].year.toString());
    findIn('crew-member', 'table-save').click();
    findIn('crew-member', 'add').click();
    get('crew-first-name').type(movie.crew[1].firstName);
    get('crew-last-name').type(movie.crew[1].lastName);
    get('crew-role').click();
    getInListbox(crewRoles[movie.crew[1].role]);
    get('crew-status').click();
    getInListbox(memberStatus[movie.crew[1].status]);
    get('crew-description').type(movie.crew[1].description);
    get('crew-film-title_0').type(movie.crew[1].filmography[0].title);
    get('crew-film-year_0').type(movie.crew[1].filmography[0].year.toString());
    get('crew-film-title_1').type(movie.crew[1].filmography[1].title);
    get('crew-film-year_1').type(movie.crew[1].filmography[1].year.toString());
    findIn('crew-member', 'row-save').click();
    get('next').click();

    //additional information
    get('budget-range').click();
    getInListbox(budgetRange[movie.estimatedBudget]);
    get('target-audience').type(movie.audience.targets[0]);
    get('row-save').click();
    get('list-add').click();
    get('target-audience').type(movie.audience.targets[1]);
    get('row-save').click();
    get('goal').click();
    getInListbox(socialGoals[movie.audience.goals[0]]);
    getInListbox(socialGoals[movie.audience.goals[1]]);
    cy.get('body').type('{esc}');
    get('next').click();

    //shooting information
    get('shooting-completed').click();
    get('date-completed').type(format(addDays(new Date(), 365), 'dd/MM/yyyy'));
    get('shooting-progress').click();
    get('date-progress').type(format(subDays(new Date(), 365), 'dd/MM/yyyy'));
    get('shooting-planned').click();
    get('start-period').click();
    getInListbox(shootingPeriod[movie.shooting.dates.planned.from.period]);
    get('start-month').click();
    getInListbox(movie.shooting.dates.planned.from.month);
    get('start-year').type(movie.shooting.dates.planned.from.year.toString());
    get('end-period').click();
    getInListbox(shootingPeriod[movie.shooting.dates.planned.to.period]);
    get('end-month').click();
    getInListbox(movie.shooting.dates.planned.to.month);
    get('end-year').type(movie.shooting.dates.planned.to.year.toString());
    get('country').click();
    getInListbox(territories[movie.shooting.locations[0].country]);
    get('cities').type(`${movie.shooting.locations[0].cities[0]}{enter}`);
    get('cities').type(`${movie.shooting.locations[0].cities[1]}{enter}`);
    get('row-save').click();
    get('list-add').click();
    get('country').click();
    getInListbox(territories[movie.shooting.locations[1].country]);
    get('cities').type(`${movie.shooting.locations[1].cities[0]}{enter}`);
    get('cities').type(`${movie.shooting.locations[1].cities[1]}{enter}`);
    get('row-save').click();
    get('event-premiere').type(movie.expectedPremiere.event);
    get('event-date').type(format(movie.expectedPremiere.date, 'dd/MM/yyyy'));
    get('next').click();

    //technical specification
    get('ratio').click();
    getInListbox(movieFormat[movie.format]);
    get('resolution').click();
    getInListbox(movieFormatQuality[movie.formatQuality]);
    get('color').click();
    getInListbox(colors[movie.color]);
    get('sound').click();
    getInListbox(soundFormat[movie.soundFormat]);
    get('next').click();

    //promotional elements : no upload possible so far in e2e - see issue #8900
    ///files
    cy.contains('Presentation Deck'); //just checking we arrived on the good page
    get('next').click();
    ///images
    cy.contains('Promotional Images');
    get('next').click();
    ///videos
    get('title').type(movie.promotional.videos.salesPitch.title);
    get('video-type').click();
    getInListbox(hostedVideoTypes[movie.promotional.videos.salesPitch.type]);
    uncheck('video-privacy');
    check('video-privacy');
    get('description').type(movie.promotional.videos.salesPitch.description);
    uncheck('pitch-privacy');
    check('pitch-privacy');
    get('next').click();
    ///notes & statements
    get('first-name').type(movie.promotional.notes[0].firstName);
    get('last-name').type(movie.promotional.notes[0].lastName);
    get('role').click();
    getInListbox(movie.promotional.notes[0].role);
    get('next').click();
    ///screener movie
    cy.contains('Screener Video');
    get('next').click();

    //last step
    ///main information
    get('production-status').should('contain', productionStatus[movie.productionStatus]);
    get('international-title').should('contain', movie.title.original);
    get('original-title').should('contain', movie.title.original);
    get('content-type').should('contain', 'Movie');
    get('reference').should('contain', movie.internalRef);
    get('poster').should('contain', 'Missing');
    get('banner').should('contain', 'Missing');
    get('release-year').should('contain', movie.release.year);
    get('release-status').should('contain', screeningStatus[movie.release.status]);
    get('country').should('contain', `${territories[movie.originCountries[0]]}, ${territories[movie.originCountries[1]]}`);
    get('language').should('contain', `${languages[movie.originalLanguages[0]]}, ${languages[movie.originalLanguages[1]]}`);
    get('genres').should('contain', `${genres[movie.genres[0]]}, ${genres[movie.genres[1]]}`);
    get('runtime').should('contain', screeningStatus[movie.runningTime.status]);
    get('director_0')
      .should('contain', movie.directors[0].firstName)
      .and('contain', movie.directors[0].lastName)
      .and('contain', directorCategory[movie.directors[0].category])
      .and('contain', movie.directors[0].description);
    ///storyline elements
    get('logline').should('contain', movie.logline);
    get('synopsis').should('contain', movie.synopsis);
    get('key-assets').should('contain', movie.keyAssets);
    get('keywords').should('contain', movie.keywords[0]).and('contain', movie.keywords[1]);
    ///production information
    get('prod-company_0')
      .should('contain',
      `${territories[movie.stakeholders.productionCompany[0].countries[0]]}, ${
          territories[movie.stakeholders.productionCompany[0].countries[1]]}`
      )
      .and('contain', movie.stakeholders.productionCompany[0].displayName);
    get('prod-company_1')
      .should('contain',
        `${territories[movie.stakeholders.productionCompany[1].countries[0]]}, ${
          territories[movie.stakeholders.productionCompany[1].countries[1]]}`
      )
      .and('contain', movie.stakeholders.productionCompany[1].displayName);
    get('coprod-company_0')
      .should('contain', territories[movie.stakeholders.coProductionCompany[0].countries[0]])
      .and('contain', movie.stakeholders.coProductionCompany[0].displayName);
    get('producer_0')
      .should('contain', producerRoles[movie.producers[0].role])
      .and('contain', movie.producers[0].firstName)
      .and('contain', movie.producers[0].lastName);
    get('producer_1')
      .should('contain', producerRoles[movie.producers[1].role])
      .and('contain', movie.producers[1].firstName)
      .and('contain', movie.producers[1].lastName);
    get('distributor_0')
      .should('contain', territories[movie.stakeholders.distributor[0].countries[0]])
      .and('contain', movie.stakeholders.distributor[0].displayName);
    get('sales-agent_0')
      .should('contain', territories[movie.stakeholders.salesAgent[0].countries[0]])
      .and('contain', movie.stakeholders.salesAgent[0].displayName);
    ///artistic team
    get('cast_0')
      .should('contain', movie.cast[0].firstName)
      .and('contain', movie.cast[0].lastName)
      .and('contain', `${movie.cast[0].filmography[0].title} (${movie.cast[0].filmography[0].year})`)
      .and('contain', `${movie.cast[0].filmography[1].title} (${movie.cast[0].filmography[1].year})`);
    get('cast_1')
      .should('contain', movie.cast[1].firstName)
      .and('contain', movie.cast[1].lastName)
      .and('contain', `${movie.cast[1].filmography[0].title} (${movie.cast[1].filmography[0].year})`)
      .and('contain', `${movie.cast[1].filmography[1].title} (${movie.cast[1].filmography[1].year})`);
    get('crew_0')
      .should('contain', movie.crew[0].firstName)
      .and('contain', movie.crew[0].lastName)
      .and('contain', `${movie.crew[0].filmography[0].title} (${movie.crew[0].filmography[0].year})`)
      .and('contain', `${movie.crew[0].filmography[1].title} (${movie.crew[0].filmography[1].year})`);
    get('crew_1')
      .should('contain', movie.crew[1].firstName)
      .and('contain', movie.crew[1].lastName)
      .and('contain', `${movie.crew[1].filmography[0].title} (${movie.crew[1].filmography[0].year})`)
      .and('contain', `${movie.crew[1].filmography[1].title} (${movie.crew[1].filmography[1].year})`);
    ///additional informationation
    get('budget-range').should('contain', budgetRange[movie.estimatedBudget]);
    get('target').should('contain', movie.audience.targets[0]).and('contain', movie.audience.targets[1]);
    get('goals').should('contain', socialGoals[movie.audience.goals[0]]).and('contain', socialGoals[movie.audience.goals[1]]);
    ///shooting informationation
    get('shooting-from-period').should('contain', shootingPeriod[movie.shooting.dates.planned.from.period]);
    get('shooting-from-month').should('contain', movie.shooting.dates.planned.from.month);
    get('shooting-from-year').should('contain', movie.shooting.dates.planned.from.year);
    get('shooting-to-period').should('contain', shootingPeriod[movie.shooting.dates.planned.to.period]);
    get('shooting-to-month').should('contain', movie.shooting.dates.planned.to.month);
    get('shooting-to-year').should('contain', movie.shooting.dates.planned.to.year);
    get('location_0').should('contain',
      territories[movie.shooting.locations[0].country] + ' - ' +
        movie.shooting.locations[0].cities[0] + ', ' +
        movie.shooting.locations[0].cities[1]
    );
    get('location_1').should('contain',
      territories[movie.shooting.locations[1].country] + ' - ' +
        movie.shooting.locations[1].cities[0] + ', ' +
        movie.shooting.locations[1].cities[1]
    );
    get('premiere-event').should('contain', movie.expectedPremiere.event);
    get('premiere-date').should('contain', format(movie.expectedPremiere.date, 'MMMM yyyy'));
    ///technical specifications
    get('ratio').should('contain', movieFormat[movie.format]);
    get('resolution').should('contain', movieFormatQuality[movie.formatQuality]);
    get('color').should('contain', colors[movie.color]);
    get('sound').should('contain', soundFormat[movie.soundFormat]);
    //promotional Elements
    get('deck').should('contain', 'Missing');
    get('scenario').should('contain', 'Missing');
    get('moodboard').should('contain', 'Missing');
    //TODO : test 'images' when fixed
    get('video_0')
      .should('contain', hostedVideoTypes[movie.promotional.videos.salesPitch.type])
      .and('contain', movie.promotional.videos.salesPitch.title);
    get('pitch').should('contain', 'Missing');
    get('note_0').should('contain', 'Note');
    get('screener').should('contain', 'Missing');

    get('publish').click();
    cy.contains(`${movie.title.original} successfully published.`)
    get('close').click();
    firestore
      .queryData({ collection: 'movies', field: 'orgIds', operator: 'array-contains', value: org.id })
      .then((movies: Movie[]) => {
        assertUrlIncludes(`c/o/dashboard/title/${movies[0].id}/activity`);
      });
    cy.contains(movie.title.original);
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
