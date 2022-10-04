import {
  // plugins
  adminAuth,
  browserAuth,
  firestore,
  maintenance,
  // cypress commands
  check,
  get,
  findIn,
  getInListbox,
  assertUrlIncludes,
  checkMovieTunnelSideNav,
} from '@blockframes/testing/cypress/browser';
import {
  Movie,
  genres,
  languages,
  territories,
  screeningStatus,
  directorCategory,
  productionStatus,
  producerRoles,
  budgetRange,
  socialGoals,
  movieFormat,
  movieFormatQuality,
  colors,
  soundFormat,
  festival,
  releaseMedias,
  premiereType,
  unitBox,
  certifications,
} from '@blockframes/model';
import { user, org, orgPermissions, moviePermissions, inDevelopmentMovie as movie, update } from '../../fixtures/dashboard/movie-tunnel';
import { format } from 'date-fns';

const injectedData = {
  [`users/${user.uid}`]: user,
  [`orgs/${org.id}`]: org,
  [`permissions/${orgPermissions.id}`]: orgPermissions,
  [`permissions/${orgPermissions.id}/documentPermissions/${moviePermissions.id}`]: moviePermissions,
  [`movies/${movie.id}`]: movie,
};

describe('Movie tunnel', () => {
  beforeEach(() => {
    cy.visit('');
    maintenance.start();
    firestore.clearTestData();
    firestore.deleteOrgMovies(org.id);
    adminAuth.deleteAllTestUsers();
    firestore.create([injectedData]);
    adminAuth.createUser({ uid: user.uid, email: user.email, emailVerified: true });
    maintenance.end();
    browserAuth.clearBrowserAuth();
    cy.visit('');
    browserAuth.signinWithEmailAndPassword(user.email);
    cy.visit('');
    get('cookies').click();
  });

  it('Edit an existing movie', () => {
    get('title').click();
    get('row_0_col_0').should('contain', movie.title.international);
    findIn('row_0_col_5', 'edit').click();
    get('next').click();
    checkMovieTunnelSideNav('released');
    //main information
    get('international-title').type(' edited');
    get('original-title').type(' edited');
    removeChip('country', 1);
    removeChip('language', 1);
    removeChip('genres', 0);
    get('next').click();
    //storyline Elements
    get('logline').type(' of love');
    get('next').click();
    //production information
    findIn('company', 'delete_1').click();
    get('next').click();
    //artistic team
    findIn('crew-member', 'row_1_col_6').find('button').eq(1).click(); //deletes the second crew member
    get('next').click();
    //selection & rewiews - new step due to 'released' status
    findIn('festival', 'name').click();
    getInListbox(festival[update.prizes[0].name]);
    findIn('festival', 'prize').type(update.prizes[0].prize);
    findIn('festival', 'prize-year').type(update.prizes[0].year.toString());
    get('festival-premiere_1').should('contain', premiereType[update.prizes[0].premiere]).click();
    findIn('festival', 'row-save').click();
    findIn('custom-festival', 'name').type(update.customPrizes[0].name);
    findIn('custom-festival', 'prize').type(update.customPrizes[0].prize);
    findIn('custom-festival', 'prize-year').type(update.customPrizes[0].year.toString());
    get('custom-premiere_2').should('contain', premiereType[update.customPrizes[0].premiere]).click();
    findIn('custom-festival', 'row-save').click();
    get('critic').type(update.review[0].criticName);
    get('journal').type(update.review[0].journalName);
    get('link').type(update.review[0].revueLink);
    get('quote').type(update.review[0].criticQuote);
    findIn('reviews', 'row-save').click();
    get('tunnel-step-save').click();
    cy.contains('Title saved');
    firestore.get(`movies/${movie.id}`).then((dbMovie: Movie) => {
      //checks intermediary save
      expect(dbMovie.title.international).to.equal(movie.title.international + ' edited');
      expect(dbMovie.title.original).to.equal(movie.title.original + ' edited');
      expect(dbMovie.prizes).to.deep.equal(update.prizes);
      expect(dbMovie.customPrizes).to.deep.equal(update.customPrizes);
      expect(dbMovie.review).to.deep.equal(update.review);
    });
    get('next').click();
    //additional information - some new data due to 'released' status
    findIn('release', 'country').click();
    getInListbox(territories[update.originalRelease[0].country]);
    findIn('release', 'media').click();
    getInListbox(releaseMedias[update.originalRelease[0].media]);
    findIn('release', 'date').type(format(update.originalRelease[0].date, 'MM/dd/yyyy'));
    findIn('release', 'row-save').click();
    findIn('box-office', 'territory').click();
    getInListbox(territories[update.boxOffice[0].territory]);
    findIn('box-office', 'unit').click();
    getInListbox(unitBox[update.boxOffice[0].unit]);
    findIn('box-office', 'earnings').type(update.boxOffice[0].value.toString());
    findIn('box-office', 'row-save').click();
    findIn('rating', 'value').type(update.rating[0].value);
    findIn('rating', 'country').click();
    getInListbox(territories[update.rating[0].country]);
    findIn('rating', 'row-save').click();
    get('certification_0').should('contain', certifications[update.certifications[0]]).click();
    get('certification_1').should('contain', certifications[update.certifications[1]]).click();
    findIn('positioning', 'delete_1').click();
    get('next').click();
    //technical specification
    get('ratio').click();
    getInListbox(movieFormat[update.format]);
    get('resolution').click();
    getInListbox(movieFormatQuality[update.formatQuality]);
    get('color').click();
    getInListbox(colors[update.color], true);
    get('sound').click();
    getInListbox(soundFormat[update.soundFormat]);
    get('next').click();
    //versions
    get('add-version').click();
    get('languages')
      .find('input')
      .type(`${Object.keys(update.languages)[0]}{enter}{esc}`);
    get('save-language').click();
    check('subtitle');
    get('next').click();
    //files - nothing yet to change, see #8900
    get('next').click();
    //images - idem #8900
    get('next').click();
    //videos
    get('description').type(' edited');
    get('next').click();
    //screener - idem #8900
    get('next').click();
    //available materials - idem #8900
    get('next').click();

    //summary & submission
    ///main information
    get('production-status').should('contain', productionStatus['released']);
    get('international-title').should('contain', movie.title.international + ' edited');
    get('original-title').should('contain', movie.title.original + ' edited');
    get('content-type').should('contain', 'Movie');
    get('reference').should('contain', movie.internalRef);
    get('poster').should('contain', 'Missing');
    get('banner').should('contain', 'Missing');
    get('release-year').should('contain', movie.release.year);
    get('release-status').should('contain', screeningStatus['confirmed']);
    get('country')
      .should('contain', territories[movie.originCountries[0]])
      .and('not.contain', territories[movie.originCountries[1]]);
    get('language')
      .should('contain', languages[movie.originalLanguages[0]])
      .and('not.contain', languages[movie.originalLanguages[1]]);
    get('genres').should('contain', genres[movie.genres[1]]).and('not.contain', genres[movie.genres[0]]);
    get('runtime').should('contain', screeningStatus['confirmed']);
    get('director_0')
      .should('contain', movie.directors[0].firstName)
      .and('contain', movie.directors[0].lastName)
      .and('contain', directorCategory[movie.directors[0].category])
      .and('contain', movie.directors[0].description);
    ///storyline elements
    get('logline').should('contain', movie.logline + ' of love');
    get('synopsis').should('contain', movie.synopsis);
    get('key-assets').should('contain', movie.keyAssets);
    get('keywords').should('contain', movie.keywords[0]).and('contain', movie.keywords[1]);
    ///production information
    get('prod-company_0')
      .should(
        'contain',
        `${territories[movie.stakeholders.productionCompany[0].countries[0]]}, ${
          territories[movie.stakeholders.productionCompany[0].countries[1]]
        }`
      )
      .and('contain', movie.stakeholders.productionCompany[0].displayName);
    get('prod-company_1').should('not.exist');
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
    get('crew_1').should('not.exist');
    ///selection & reviews
    get('festival')
      .should('contain', festival[update.prizes[0].name])
      .and('contain', update.prizes[0].prize)
      .and('contain', premiereType[update.prizes[0].premiere]);
    get('custom-festival')
      .should('contain', update.customPrizes[0].name)
      .and('contain', update.customPrizes[0].prize)
      .and('contain', premiereType[update.customPrizes[0].premiere]);
    get('reviews')
      .should('contain', update.review[0].journalName)
      .and('contain', update.review[0].revueLink)
      .and('contain', update.review[0].criticQuote);
    ///additional information
    get('release')
      .should('contain', territories[update.originalRelease[0].country])
      .and('contain', releaseMedias[update.originalRelease[0].media])
      .and('contain', format(update.originalRelease[0].date, 'MM/dd/yyyy'));
    get('box-office').should('contain', update.boxOffice[0].value.toLocaleString('en-US')).and('contain', '€');
    get('rating').should('contain', territories[update.rating[0].country]).and('contain', update.rating[0].value);
    get('budget-range').should('contain', budgetRange[movie.estimatedBudget]);
    get('qualifications')
      .should('contain', certifications[update.certifications[0]])
      .and('contain', certifications[update.certifications[1]]);
    get('target').should('contain', movie.audience.targets[0]).and('not.contain', movie.audience.targets[1]);
    get('goals').should('contain', socialGoals[movie.audience.goals[0]]).and('contain', socialGoals[movie.audience.goals[1]]);
    ///technical specifications
    get('ratio').should('contain', movieFormat[update.format]);
    get('resolution').should('contain', movieFormatQuality[update.formatQuality]);
    get('color').should('contain', colors[update.color]);
    get('sound').should('contain', soundFormat[update.soundFormat]);
    ///versions
    get('original-version').should('contain', 'Available');
    get('available-version_0').should('contain', languages[Object.keys(update.languages)[0]]).and('contain', 'subs');
    //promotional Elements
    get('deck').should('contain', 'Missing');
    get('scenario').should('contain', 'Missing');
    get('moodboard').should('contain', 'Missing');
    get('pitch').should('contain', 'Missing');
    get('screener').should('contain', 'Missing');
    get('submit').click();
    cy.contains(`${movie.title.international} edited was successfully submitted.`);
    assertUrlIncludes(`c/o/dashboard/tunnel/movie/${movie.id}/end`);
    get('end-button').click();
    assertUrlIncludes(`c/o/dashboard/title/${movie.id}/main`);
    get('titles-header-title').should('contain', movie.title.international) + ' edited';
  });
});

function removeChip(selector: string, order: number) {
  return get(selector).find('mat-chip').eq(order).find('.mat-chip-remove').click();
}
