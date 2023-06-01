import {
  // plugins
  adminAuth,
  browserAuth,
  firestore,
  gmail,
  maintenance,
  // cypress commands
  check,
  get,
  findIn,
  assertUrlIncludes,
  checkMovieTunnelSideNav,
  saveTitle,
  assertMultipleTexts,
  interceptEmailGmail,
  // helpers
  getSubject,
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
  certifications,
} from '@blockframes/model';
import {
  user,
  org,
  orgPermissions,
  moviePermissions,
  inDevelopmentMovie as movie,
  update,
} from '../../fixtures/dashboard/movie-tunnel';
import { format } from 'date-fns';
import { gmailSupport } from '@blockframes/utils/constants';

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
    firestore.queryDelete({ collection: 'movies', field: 'orgIds', operator: 'array-contains', value: org.id });
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
    get('row_0_col_1').should('contain', movie.title.international);
    findIn('row_0_col_6', 'edit').click();
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
    get(`option_${update.prizes[0].name}`).click();
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
    saveTitle();
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
    get(`option_${update.originalRelease[0].country}`).click();
    findIn('release', 'media').click();
    get(`option_${update.originalRelease[0].media}`).click();
    findIn('release', 'date').type(format(update.originalRelease[0].date, 'MM/dd/yyyy'));
    findIn('release', 'row-save').click();
    findIn('box-office', 'territory').click();
    get(`option_${update.boxOffice[0].territory}`).click();
    findIn('box-office', 'unit').click();
    get(`option_${update.boxOffice[0].unit}`).click();
    findIn('box-office', 'earnings').type(update.boxOffice[0].value.toString());
    findIn('box-office', 'row-save').click();
    findIn('rating', 'value').type(update.rating[0].value);
    findIn('rating', 'country').click();
    get(`option_${update.rating[0].country}`).click();
    findIn('rating', 'row-save').click();
    get('certification_eof').click();
    get('certification_europeanQualification').click();
    findIn('positioning', 'delete_1').click();
    get('next').click();
    //technical specification
    get('ratio').click();
    get(`option_${update.format}`).click();
    get('resolution').click();
    get(`option_${update.formatQuality}`).click();
    get('color').click();
    get(`option_${update.color}`).click();
    get('sound').click();
    get(`option_${update.soundFormat}`).click();
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
    assertMultipleTexts('director_0', [
      movie.directors[0].firstName,
      movie.directors[0].lastName,
      directorCategory[movie.directors[0].category],
      movie.directors[0].description,
    ]);
    ///storyline elements
    get('logline').should('contain', movie.logline + ' of love');
    get('synopsis').should('contain', movie.synopsis);
    get('key-assets').should('contain', movie.keyAssets);
    assertMultipleTexts('keywords', [movie.keywords[0], movie.keywords[1]]);
    ///production information
    assertMultipleTexts('prod-company_0', [
      `${territories[movie.stakeholders.productionCompany[0].countries[0]]}, ${
        territories[movie.stakeholders.productionCompany[0].countries[1]]
      }`,
      movie.stakeholders.productionCompany[0].displayName,
    ]);
    get('prod-company_1').should('not.exist');
    assertMultipleTexts('coprod-company_0', [
      territories[movie.stakeholders.coProductionCompany[0].countries[0]],
      movie.stakeholders.coProductionCompany[0].displayName,
    ]);
    assertMultipleTexts('producer_0', [
      producerRoles[movie.producers[0].role],
      movie.producers[0].firstName,
      movie.producers[0].lastName,
    ]);
    assertMultipleTexts('producer_1', [
      producerRoles[movie.producers[1].role],
      movie.producers[1].firstName,
      movie.producers[1].lastName,
    ]);
    assertMultipleTexts('distributor_0', [
      territories[movie.stakeholders.distributor[0].countries[0]],
      movie.stakeholders.distributor[0].displayName,
    ]);
    assertMultipleTexts('sales-agent_0', [
      territories[movie.stakeholders.salesAgent[0].countries[0]],
      movie.stakeholders.salesAgent[0].displayName,
    ]);
    ///artistic team
    assertMultipleTexts('cast_0', [
      movie.cast[0].firstName,
      movie.cast[0].lastName,
      `${movie.cast[0].filmography[0].title} (${movie.cast[0].filmography[0].year})`,
      `${movie.cast[0].filmography[1].title} (${movie.cast[0].filmography[1].year})`,
    ]);
    assertMultipleTexts('cast_1', [
      movie.cast[1].firstName,
      movie.cast[1].lastName,
      `${movie.cast[1].filmography[0].title} (${movie.cast[1].filmography[0].year})`,
      `${movie.cast[1].filmography[1].title} (${movie.cast[1].filmography[1].year})`,
    ]);
    assertMultipleTexts('crew_0', [
      movie.crew[0].firstName,
      movie.crew[0].lastName,
      `${movie.crew[0].filmography[0].title} (${movie.crew[0].filmography[0].year})`,
      `${movie.crew[0].filmography[1].title} (${movie.crew[0].filmography[1].year})`,
    ]);
    get('crew_1').should('not.exist');
    ///selection & reviews
    assertMultipleTexts('festival', [
      festival[update.prizes[0].name],
      update.prizes[0].prize,
      premiereType[update.prizes[0].premiere],
    ]);
    assertMultipleTexts('custom-festival', [
      update.customPrizes[0].name,
      update.customPrizes[0].prize,
      premiereType[update.customPrizes[0].premiere],
    ]);
    assertMultipleTexts('reviews', [update.review[0].journalName, update.review[0].revueLink, update.review[0].criticQuote]);
    ///additional information
    assertMultipleTexts('release', [
      territories[update.originalRelease[0].country],
      releaseMedias[update.originalRelease[0].media],
      format(update.originalRelease[0].date, 'MM/dd/yyyy'),
    ]);
    assertMultipleTexts('box-office', [update.boxOffice[0].value.toLocaleString('en-US'), '€']);
    assertMultipleTexts('rating', [territories[update.rating[0].country], update.rating[0].value]);
    get('budget-range').should('contain', budgetRange[movie.estimatedBudget]);
    assertMultipleTexts('qualifications', [certifications[update.certifications[0]], certifications[update.certifications[1]]]);
    get('target').should('contain', movie.audience.targets[0]).and('not.contain', movie.audience.targets[1]);
    assertMultipleTexts('goals', [socialGoals[movie.audience.goals[0]], socialGoals[movie.audience.goals[1]]]);
    ///technical specifications
    get('ratio').should('contain', movieFormat[update.format]);
    get('resolution').should('contain', movieFormatQuality[update.formatQuality]);
    get('color').should('contain', colors[update.color]);
    get('sound').should('contain', soundFormat[update.soundFormat]);
    ///versions
    get('original-version').should('contain', 'Available');
    assertMultipleTexts('available-version_0', [languages[Object.keys(update.languages)[0]], 'Subs']);
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
    interceptEmailGmail(`to:${gmailSupport}`).then(mail => {
      const subject = getSubject(mail);
      expect(subject).to.include(`${movie.title.international} edited was submitted by ${org.name}`);
      gmail.deleteEmail(mail.id);
    });
  });
});

function removeChip(selector: string, order: number) {
  return get(selector).find('mat-chip').eq(order).find('.mat-chip-remove').click();
}
