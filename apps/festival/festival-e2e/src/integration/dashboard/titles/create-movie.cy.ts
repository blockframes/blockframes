import {
  // plugins
  adminAuth,
  browserAuth,
  firestore,
  gmail,
  storage,
  maintenance,
  // cypress commands
  check,
  uncheck,
  get,
  findIn,
  snackbarShould,
  getAllStartingWith,
  assertUrlIncludes,
  saveTitle,
  escapeKey,
  assertMultipleTexts,
  interceptEmail,
  //helpers
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
  shootingPeriod,
  movieFormat,
  movieFormatQuality,
  colors,
  soundFormat,
  months,
  AllowedFileType,
  Privacy,
} from '@blockframes/model';
import { user, org, permissions, inDevelopmentMovie as movie } from '../../../fixtures/dashboard/movie-tunnel';
import { addDays, subDays, format } from 'date-fns';
import { jwplayer } from '@env';

interface UploadCheckParameters {
  movie: Movie;
  baseField: string;
  index?: number;
  privacy?: Privacy;
  isVideo?: boolean;
}

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
    firestore.queryDelete({ collection: 'movies', field: 'orgIds', operator: 'array-contains', value: org.id });
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
    //dashboard
    get('no-title').should('exist');
    get('add-title').click();
    //loby
    get('start').click();
    //title status
    get(`status_${movie.productionStatus}`).click();
    get('next').click();

    //main
    get('international-title').type(movie.title.international);
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
    get(`option_${movie.runningTime.status}`).click();
    get('season-count').should('not.exist');
    get('episode-count').should('not.exist');
    ///uploads
    testUploadGuard('poster-upload', ['pdf', 'video']);
    get('poster-upload').selectFile('src/fixtures/default-poster.webp', { action: 'drag-drop' });
    get('crop-image').click();
    saveTitle(true);
    get('banner-upload').selectFile('src/fixtures/default-banner.webp', { action: 'drag-drop' });
    get('crop-image').click();
    saveTitle(true);
    ///checking TV related fields
    get('content-type').click();
    get('option_tv').click();
    get('season-count').type('5');
    get('episode-count').type('20');
    ///back to movie type
    get('content-type').click();
    get('option_movie').click();
    ///general information
    get('release-year').type(movie.release.year.toString());
    get('status').click();
    getAllStartingWith('option_').then($options => {
      for (const status of ['Estimated', 'Confirmed']) {
        cy.wrap($options).should('contain', status);
      }
    });
    get(`option_${movie.release.status}`).click();
    get('country').children().eq(0).click();
    get(`option_${movie.originCountries[0]}`).click();
    get('country').find('input').type(`${movie.originCountries[1]}{enter}{esc}`); //writing it entirely
    get('language').children().eq(0).click();
    get(`option_${movie.originalLanguages[0]}`).click();
    get('language').find('input').type(`${movie.originalLanguages[1]}{enter}{esc}`);
    get('genres').children().eq(0).click();
    get(`option_${movie.genres[0]}`).click();
    get('genres').find('input').type(`${movie.genres[1]}{enter}{esc}`);
    ///directors
    get('table-save').should('be.disabled');
    get('first-name').type(movie.directors[0].firstName);
    get('last-name').type(movie.directors[0].lastName);
    get('director-status').click();
    get(`option_${movie.directors[0].status}`).click();
    get('director-category').click();
    get(`option_${movie.directors[0].category}`).click();
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

    //production information
    ///production company
    get('production-company-name').type(movie.stakeholders.productionCompany[0].displayName);
    get('production-country').click();
    get(`option_${movie.stakeholders.productionCompany[0].countries[0]}`).click();
    get('production-country').find('input').type(`${movie.stakeholders.productionCompany[0].countries[1]}{enter}{esc}`);
    findIn('company', 'row-save').click();
    findIn('company', 'list-add').click();
    get('production-company-name').type(movie.stakeholders.productionCompany[1].displayName);
    get('production-country').click();
    get(`option_${movie.stakeholders.productionCompany[1].countries[0]}`).click();
    get('production-country').find('input').type(`${movie.stakeholders.productionCompany[1].countries[1]}{enter}{esc}`);
    findIn('company', 'row-save').click();
    ///co-production company
    get('co-production-company-name').type(movie.stakeholders.coProductionCompany[0].displayName);
    get('co-production-country').click();
    get(`option_${movie.stakeholders.coProductionCompany[0].countries[0]}`).click();
    get('co-production-country').find('input').type(`${movie.stakeholders.coProductionCompany[0].countries[1]}{enter}{esc}`);
    findIn('co-company', 'row-save').click();
    ///producers
    get('first-name').type(movie.producers[0].firstName);
    get('last-name').type(movie.producers[0].lastName);
    get('producer-role').click();
    get(`option_${movie.producers[0].role}`).click();
    findIn('producers', 'row-save').click();
    findIn('producers', 'list-add').click();
    get('first-name').type(movie.producers[1].firstName);
    get('last-name').type(movie.producers[1].lastName);
    get('producer-role').click();
    get(`option_${movie.producers[1].role}`).click();
    findIn('producers', 'row-save').click();
    ///distributors
    get('distribution-company-name').type(movie.stakeholders.distributor[0].displayName);
    get('distribution-country').click();
    get(`option_${movie.stakeholders.distributor[0].countries[0]}`).click();
    findIn('distributors', 'row-save').click();
    ///sales
    get('sales-company-name').type(movie.stakeholders.salesAgent[0].displayName);
    get('sales-country').click();
    get(`option_${movie.stakeholders.salesAgent[0].countries[0]}`).click();
    findIn('sales', 'row-save').click();
    get('next').click();

    //artistic team
    ///cast member
    get('cast-first-name').type(movie.cast[0].firstName);
    get('cast-last-name').type(movie.cast[0].lastName);
    get('cast-status').click();
    get(`option_${movie.cast[0].status}`).click();
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
    get(`option_${movie.cast[1].status}`).click();
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
    get(`option_${movie.crew[0].role}`).click();
    get('crew-status').click();
    get(`option_${movie.crew[0].status}`).click();
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
    get(`option_${movie.crew[1].role}`).click();
    get('crew-status').click();
    get(`option_${movie.crew[1].status}`).click();
    get('crew-description').type(movie.crew[1].description);
    get('crew-film-title_0').type(movie.crew[1].filmography[0].title);
    get('crew-film-year_0').type(movie.crew[1].filmography[0].year.toString());
    get('crew-film-title_1').type(movie.crew[1].filmography[1].title);
    get('crew-film-year_1').type(movie.crew[1].filmography[1].year.toString());
    findIn('crew-member', 'row-save').click();
    get('next').click();

    //additional information
    get('budget-range').click();
    get(`option_${movie.estimatedBudget}`).click();
    get('audience').type(movie.audience.targets[0]);
    get('row-save').click();
    get('list-add').click();
    get('audience').type(movie.audience.targets[1]);
    get('row-save').click();
    get('goals').click();
    get(`option_${movie.audience.goals[0]}`).click();
    get(`option_${movie.audience.goals[1]}`).click();
    escapeKey();
    get('next').click();

    //shooting information
    get('shooting-completed').click();
    get('date-completed').type(format(addDays(new Date(), 365), 'dd/MM/yyyy'));
    get('shooting-progress').click();
    get('date-progress').type(format(subDays(new Date(), 365), 'dd/MM/yyyy'));
    get('shooting-planned').click();
    get('start-period').click();
    get(`option_${movie.shooting.dates.planned.from.period}`).click();
    get('start-month').click();
    get(`option_${movie.shooting.dates.planned.from.month}`).click();
    get('start-year').type(movie.shooting.dates.planned.from.year.toString());
    get('end-period').click();
    get(`option_${movie.shooting.dates.planned.to.period}`).click();
    get('end-month').click();
    get(`option_${movie.shooting.dates.planned.to.month}`).click();
    get('end-year').type(movie.shooting.dates.planned.to.year.toString());
    get('country').click();
    get(`option_${movie.shooting.locations[0].country}`).click();
    get('cities').type(`${movie.shooting.locations[0].cities[0]}{enter}`);
    get('cities').type(`${movie.shooting.locations[0].cities[1]}{enter}`);
    get('row-save').click();
    get('list-add').click();
    get('country').click();
    get(`option_${movie.shooting.locations[1].country}`).click();
    get('cities').type(`${movie.shooting.locations[1].cities[0]}{enter}`);
    get('cities').type(`${movie.shooting.locations[1].cities[1]}{enter}`);
    get('row-save').click();
    get('event-premiere').type(movie.expectedPremiere.event);
    get('event-date').type(format(movie.expectedPremiere.date, 'dd/MM/yyyy'));
    get('next').click();

    //technical specification
    get('ratio').click();
    get(`option_${movie.format}`).click();
    get('resolution').click();
    get(`option_${movie.formatQuality}`).click();
    get('color').click();
    get(`option_${movie.color}`).click();
    get('sound').click();
    get(`option_${movie.soundFormat}`).click();
    get('next').click();

    ///files
    cy.contains('Presentation Deck');
    testUploadGuard('presentation-deck-upload', ['image', 'video']);
    get('presentation-deck-upload').selectFile('src/fixtures/default-presentation-deck.pdf', { action: 'drag-drop' });
    saveTitle(true);
    get('scenario-upload').selectFile('src/fixtures/default-scenario.pdf', { action: 'drag-drop' });
    saveTitle(true);
    get('moodboard-upload').selectFile('src/fixtures/default-moodboard.pdf', { action: 'drag-drop' });
    saveTitle(true);
    get('next').click();
    ///images
    cy.contains('Promotional Images');
    get('image-upload_0').selectFile('src/fixtures/default-image-1.webp', { action: 'drag-drop' });
    get('crop-image').click();
    saveTitle(true);
    get('add').click();
    get('image-upload_1').selectFile('src/fixtures/default-image-2.webp', { action: 'drag-drop' });
    get('crop-image').click();
    saveTitle(true);
    get('next').click();
    ///videos
    get('title').type(movie.promotional.videos.otherVideo.title);
    get('video-type').click();
    get(`option_${movie.promotional.videos.otherVideo.type}`).click();
    uncheck('video-privacy');
    check('video-privacy');
    testUploadGuard('video-upload', ['image', 'pdf']);
    get('video-upload').selectFile('src/fixtures/default-video.mp4', { action: 'drag-drop' });
    saveTitle(true);
    get('description').type(movie.promotional.videos.salesPitch.description);
    uncheck('pitch-privacy');
    check('pitch-privacy');
    get('sales-pitch-upload').selectFile('src/fixtures/default-pitch.mp4', { action: 'drag-drop' });
    saveTitle(true);
    get('next').click();
    ///notes & statements
    get('first-name').type(movie.promotional.notes[0].firstName);
    get('last-name').type(movie.promotional.notes[0].lastName);
    get('role').click();
    get(`option_${movie.promotional.notes[0].role}`).click();
    get('note-upload').selectFile('src/fixtures/default-note.pdf', { action: 'drag-drop' });
    get('row-save').click();
    saveTitle(true);
    get('next').click();
    ///screener movie
    cy.contains('Screener Video');
    get('screener-upload').selectFile('src/fixtures/default-screener.mp4', { action: 'drag-drop' });
    saveTitle(true);
    get('next').click();

    //last step
    ///main information
    get('production-status').should('contain', productionStatus[movie.productionStatus]);
    get('international-title').should('contain', movie.title.international);
    get('original-title').should('contain', movie.title.original);
    get('content-type').should('contain', 'Movie');
    get('reference').should('contain', movie.internalRef);
    get('release-year').should('contain', movie.release.year);
    get('release-status').should('contain', screeningStatus[movie.release.status]);
    get('country').should('contain', `${territories[movie.originCountries[0]]}, ${territories[movie.originCountries[1]]}`);
    get('language').should('contain', `${languages[movie.originalLanguages[0]]}, ${languages[movie.originalLanguages[1]]}`);
    get('genres').should('contain', `${genres[movie.genres[0]]}, ${genres[movie.genres[1]]}`);
    get('runtime').should('contain', screeningStatus[movie.runningTime.status]);
    assertMultipleTexts('director_0', [
      movie.directors[0].firstName,
      movie.directors[0].lastName,
      directorCategory[movie.directors[0].category],
      movie.directors[0].description,
    ]);
    ///storyline elements
    get('logline').should('contain', movie.logline);
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
    assertMultipleTexts('prod-company_1', [
      `${territories[movie.stakeholders.productionCompany[1].countries[0]]}, ${
        territories[movie.stakeholders.productionCompany[1].countries[1]]
      }`,
      movie.stakeholders.productionCompany[1].displayName,
    ]);
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
    assertMultipleTexts('crew_1', [
      movie.crew[1].firstName,
      movie.crew[1].lastName,
      `${movie.crew[1].filmography[0].title} (${movie.crew[1].filmography[0].year})`,
      `${movie.crew[1].filmography[1].title} (${movie.crew[1].filmography[1].year})`,
    ]);
    ///additional information
    get('budget-range').should('contain', budgetRange[movie.estimatedBudget]);
    assertMultipleTexts('target', [movie.audience.targets[0], movie.audience.targets[1]]);
    assertMultipleTexts('goals', [socialGoals[movie.audience.goals[0]], socialGoals[movie.audience.goals[1]]]);
    ///shooting information
    get('shooting-from-period').should('contain', shootingPeriod[movie.shooting.dates.planned.from.period]);
    get('shooting-from-month').should('contain', months[movie.shooting.dates.planned.from.month]);
    get('shooting-from-year').should('contain', movie.shooting.dates.planned.from.year);
    get('shooting-to-period').should('contain', shootingPeriod[movie.shooting.dates.planned.to.period]);
    get('shooting-to-month').should('contain', months[movie.shooting.dates.planned.to.month]);
    get('shooting-to-year').should('contain', movie.shooting.dates.planned.to.year);
    get('location_0').should(
      'contain',
      territories[movie.shooting.locations[0].country] +
        ' - ' +
        movie.shooting.locations[0].cities[0] +
        ', ' +
        movie.shooting.locations[0].cities[1]
    );
    get('location_1').should(
      'contain',
      territories[movie.shooting.locations[1].country] +
        ' - ' +
        movie.shooting.locations[1].cities[0] +
        ', ' +
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

    get('publish').click();
    snackbarShould('contain', `${movie.title.international} successfully published.`);

    get('poster').should('contain', 'default-poster');
    get('banner').should('contain', 'default-banner');
    get('deck').should('contain', 'default-presentation-deck');
    get('scenario').should('contain', 'default-scenario');
    get('moodboard').should('contain', 'default-moodboard');
    get('image_0').should('contain', 'default-image-1');
    get('image_1').should('contain', 'default-image-2');
    get('other-video').should('contain', 'Teaser - Test Promotional Video - default-video.mp4');
    get('pitch').should('contain', 'default-pitch.mp4');
    get('note_0').should('contain', 'Note first Note last - Director - default-note.pdf');
    get('screener').should('contain', 'default-screener.mp4');

    get('close-tunnel').click();
    firestore
      .queryData({ collection: 'movies', field: 'orgIds', operator: 'array-contains', value: org.id })
      .then(([movie]: Movie[]) => {
        checkUpload({ movie, baseField: 'banner' });
        checkUpload({ movie, baseField: 'poster' });
        checkUpload({ movie, baseField: 'promotional.moodboard' });
        checkUpload({ movie, baseField: 'promotional.presentation_deck' });
        checkUpload({ movie, baseField: 'promotional.videos.salesPitch', isVideo: true });
        checkUpload({ movie, baseField: 'promotional.still_photo', index: 0 });
        checkUpload({ movie, baseField: 'promotional.still_photo', index: 1 });
        checkUpload({ movie, baseField: 'promotional.videos.otherVideo', isVideo: true });
        checkUpload({ movie, baseField: 'promotional.notes', index: 0 });
        checkUpload({ movie, baseField: 'promotional.scenario' });
        checkUpload({ movie, baseField: 'promotional.videos.screener', isVideo: true, privacy: 'protected' });

        assertUrlIncludes(`c/o/dashboard/title/${movie.id}/activity`);
      });
    get('titles-header-title').should('contain', movie.title.international);
    interceptEmail(`to:${user.email}`).then(mail => {
      const subject = getSubject(mail);
      expect(subject).to.eq(
        `${movie.title.international} was successfully published on the Archipel Market marketplace`
      );
      gmail.deleteEmail(mail.id);
    });
  });
});

function testUploadGuard(selector: string, tests: AllowedFileType[]) {
  return tests.map(test => {
    switch (test) {
      case 'image':
        get(selector).selectFile('src/fixtures/default-image-1.webp', { action: 'drag-drop' });
        snackbarShould('contain', 'Unsupported file type: "image/webp".');
        snackbarShould('not.exist');
        break;
      case 'pdf':
        get(selector).selectFile('src/fixtures/default-note.pdf', { action: 'drag-drop' });
        snackbarShould('contain', 'Unsupported file type: "application/pdf".');
        snackbarShould('not.exist');
        break;
      case 'video':
        get(selector).selectFile('src/fixtures/default-video.mp4', { action: 'drag-drop' });
        snackbarShould('contain', 'Unsupported file type: "video/mp4".');
        snackbarShould('not.exist');
        break;
      default:
        throw new Error('Function testUploadGuard() does not have a case for this format yet.');
    }
  });
}

function checkUpload({ movie, baseField, index, privacy = 'public', isVideo = false }: UploadCheckParameters) {
  const value = index >= 0 ? getDeepValue(movie, baseField)[index] : getDeepValue(movie, baseField);
  expect(value.collection).to.equal('movies');
  expect(value.field).to.equal(baseField);
  expect(value.docId).to.equal(movie.id);
  expect(value.privacy).to.equal(privacy);
  if (isVideo) expect(value.jwPlayerId).to.equal(jwplayer.testVideoId);
  expect(value.storagePath).to.contain(`movies/${movie.id}/${baseField}/default-`);

  storage.exists(`${value.privacy}/${value.storagePath}`).then(exists => expect(exists).to.be.true);
}

function getDeepValue(movie: Movie, path: string) {
  let result = movie;
  for (const key of path.split('.')) {
    result = result[key];
  }
  return result;
}
