/// <reference types="cypress" />

import { acceptCookie, clearDataAndPrepareTest, clickOnMenu } from '@blockframes/e2e/utils/functions';
import { signInAndNavigateToMain } from '../../support/utils/utils';
import { User, USER } from '@blockframes/e2e/fixtures/users';
import { SEC } from '@blockframes/e2e/utils';

/**
 * To debug a particular step, turn debug_mode = true and
 * set debug key in step & section to true
 * Note : 'Production Status' debug should be set to true
 */
const debug_mode = false;

const getStepsToSkip = (movie: Record<string, any>) => {
  if (movie.productionStatus.status5) {
    return ['Shooting Information', 'Notes & Statements'];
  }

  return [];
}
const userFixture = new User();
const users = [ userFixture.getByUID(USER.Jean) ];

const Movie = {
  productionStatus: {
    status5: true
  },
  mainInfo : {
    "international-title": 'Lagerfeld Confidential',
    "original-title": 'Lagerfeld Confidential',
    "content-type": 'TV Film',
    "reference": 'Lagerfeld',
    "release-year": '2007',
    "status": 'Confirmed',
    "country": 'France',
    "language": 'French',
    "genres": 'Documentary',
    "other-genres": 'Real life movie , New cinema{enter}',
    "run-time": 87,
    "screening-status": 'Confirmed',
    "first-name": 'Rodolphe',
    "last-name": 'Marconi',
    "director-status": 'Confirmed',
    "director-category": 'Prestige',
    "director-desc": 'Oscar Winner',
    "film-title": 'Ceci est mon corps (2001)',
    "film-year": '2001'
  },
  storyElements: {
    "logline": 'An up-close-and-personal portrait of the fashion icon, Karl Lagerfeld.',
    "synopsis": 'I saw this film at the Stockholm Film festival. Before watching I read some reviews on other websites and found criticisms for the lack of depth. \nOverall very good though.',
    "key-assets": 'One of the few films presenting Karl Lagerfeld.',
    "keyword": 'Karl Lagerfeld, Fashion{enter}'
  },
  production: {
    "production-company-name": 'Realitism Films',
    "production-country": 'France',
    "co-production-company-name": 'Backup Media',
    "co-production-country": 'Germany',
    "first-name": 'Grégory',
    "last-name": 'Bernard',
    "producer-role": 'Executive Producer',
    "distribution-company-name": 'Pretty Picture',
    "distribution-country": 'France',
    "sales-company-name": 'Playtime',
    "sales-country": 'France',
  },
  artisticTeam: {
    "cast-first-name": 'Nicole',
    "cast-last-name": 'Kidman',
    "cast-status": 'Confirmed',
    "cast-description": 'Elegant Nicole Kidman is known as one of Hollywood\'s top Australian imports.',
    "cast-film1": 'Bombshell',
    "cast-year1": '2018',
    "crew-first-name": 'Karl',
    "crew-last-name": 'Lagerfeld',
    "crew-role": 'Costume Designer',
    "crew-status": 'Confirmed',
    "crew-description": 'Karl Otto Lagerfeldt was a costume designer and actor, known for The Tale of a Fairy (2011).',
    "crew-film1": 'Love Comedy',
    "crew-year1": '1989'
  },
  reviews: {
    "festival-name": 'Oscar Academy Awards',
    "prize": 'Filmfare Award',
    "prize-year": '2020',
    "critic-name": 'Aunt Agony',
    "journal-name": 'Bharka Dutt\'s Blog',
    "link": 'useless-blog.wordpress.com',
    "quote": 'Best film of the year. Can drive away your Corona Blues'
  },
  additionalInfo: {
    "release-country": 'France',
    "release-media": 'Video',
    "boxoffice-territory": 'France',
    "release-date": '01/01/2020',
    "budget-range": '$10 - 20 millions',
    "country": 'France',
    "boxoffice-earnings": '120000',
    "rating": 'Tous publics',
    "rating-country": 'France',
    "certification2": true,
    "certification3": true
  },
  shootingInformation: {
    "shooting-completed": true,
    "date-completed": '31/12/2019',
    "country": 'France',
    "cities": 'Paris, Provence, Rochefort{enter}',
    "event-premiere": 'Cannes Festival',
    "event-date": '01/02/2020'
  },
  techSpec: {
    "aspectRatio": '1.66',
    "resolution": '4K',
    "colorInfo": 'Color & Black & White',
    "soundMix": 'Dolby SR'
  },
  availableVersions: {
    "languages": 'English',
    "original-version": false,
  },
  files: {
    //"presentation-deck": '',
    //"scenario": '',
    //"moodboard": ''
  },
  notesStatements: {
    "first-name": 'Rodolphe',
    "last-name": 'Marconi',
    "role": 'Other',
    "intent-note": JSON.stringify({type: 'app/pdf', filename: '1234.pdf'})
  },
  promoElements: {

  },
  videos: {
    "description": "Lagerfeld Confidential was created with a delicate balance between comedy and drama."
  }
}

let val: Record<string, any> = Movie.mainInfo;
val['info-runtime'] = `${val['run-time']} min (${val['status']})`;
val['dir-info1'] = `${val['first-name']} ${val['last-name']} (${val['director-category']}) ${val['director-desc']}`;

val = Movie.production;
val['prod-co-summary'] = `${val['production-country']} ${val['production-company-name']}`;
val['coprod-co-summary'] = `${val['co-production-country']} ${val['co-production-company-name']}`;
val['producer-summary'] = `${val['producer-role']} ${val['first-name']} ${val['last-name']}`;
val['distributor-summary'] = `${val['distribution-country']} ${val['distribution-company-name']}`;
val['salesAgent-summary'] = `${val['sales-country']} ${val['sales-company-name']}`;

val = Movie.storyElements;
val['synopsis'] = val['synopsis'].replace(/(\r\n|\n|\r)/gm, "");
val['keyword-summary'] = val['keyword'].substring(0, val['keyword'].indexOf('{'));

val = Movie.artisticTeam;
val['cast-summary'] = `${val['cast-first-name']} ${val['cast-last-name']} ${val['cast-film1']}`;
val['crew-summary'] = `${val['crew-first-name']} ${val['crew-last-name']} (${val['crew-role']}) ${val['crew-film1']}`;

const testSteps = [
  {title: 'Production Status', selector: 'movie-form-title-status mat-radio-button',
    input: 'productionStatus', comp_save: [], save_form: true, debug: true},
  {title: 'Main Information', selector: 'movie-form-main input, textarea, static-select, chips-autocomplete',
    input: 'mainInfo', comp_save: [], save_form: true, debug: false},
  {title: 'Storyline Elements', selector: 'movie-form-story-elements textarea, input',
    input: 'storyElements', comp_save: [], save_form: true, debug: false},
  {title: 'Production Information', selector: 'movie-form-production input, static-select, mat-select, chips-autocomplete',
    input: 'production', comp_save: ['row-save'], save_form: true, debug: false},
  {title: 'Artistic Team', selector: 'movie-form-artistic input, textarea, static-select',
    input: 'artisticTeam', comp_save: ['table-save'], save_form: true, debug: false},
  {title: 'Selections & Reviews', selector: 'movie-form-reviews static-select, input, textarea',
    input: 'reviews', comp_save: [], save_form: true, debug: false},
  {title: 'Additional Information', selector: 'movie-form-additional-information input, mat-button-toggle, static-select, movie-form-budget-range, static-select',
    input: 'additionalInfo', comp_save: [], save_form: true, debug: false},
  {title: 'Shooting Information', selector: 'movie-shooting-information mat-radio-button, static-select, input',
    input: 'shootingInformation', comp_save: [], save_form: true, debug: false},
  {title: 'Technical Specification', selector: 'movie-form-technical-info static-select',
    input: 'techSpec', comp_save: [], save_form: true, debug: false},
  {title: 'Available Versions', selector: 'movie-form-available-versions mat-slide-toggle, input',
    input: 'availableVersions', comp_save: [], save_form: true, debug: false},
  {title: 'Files', selector: 'movie-form-media-files file-uploader',
    input: 'files',  comp_save: [], save_form: true, debug: false},
  {title: 'Notes & Statements', selector: 'movie-form-media-notes input, mat-select, file-uploader',
    input: 'notesStatements', comp_save: [], save_form: true, debug: false},
  {title: 'Images', selector: 'movie-form-media-images',
    input: 'promoElements', comp_save: [], save_form: true, debug: false},
  {title: 'Videos', selector: 'movie-form-media-videos textarea, input',
    input: 'videos', comp_save: [], save_form: true, debug: false}
];

const MovieFormSummary = [
  {title: 'Main Information', selector: '#main-information [test-id]',
    input: Movie.mainInfo, debug: false },
  {title: 'Storyline Elements', selector: '#storyline-elements [test-id]',
    input: Movie.storyElements, debug: false },
  {title: 'Production Information', selector: '#production-information [test-id]',
    input: Movie.production, debug: false },
  {title: 'Artistic Team', selector: '#artistic-team [test-id]',
    input: Movie.artisticTeam, debug: false },
  {title: 'Technical Specifications', selector: '#technical-information [test-id]',
    input: Movie.techSpec, debug: false },
];

// Note: set debugMovieId to movie document ID to debug the tests.
//  for normal runs, do not set a value for the movie ID.
//  also use it.skip tests that are required to be run.
const debugMovieId = '';

/**
 * debugMovieTitle : Helper function to test a movie title for any step
 *    Within any test call it like this: debugMovieTitle(titleId, 'summary')
 * @param id : movie doc ID
 * @param loc : tunnel path (main / summary / etc) to debug.
 * Note : Retain the function as well as eslint override
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const debugMovieTitle = (id: string, loc: string) => {
  cy.log('Check movie:', id);

  //GoTo movie loc (summary, main ..)
  const path = `http://localhost:4200/c/o/dashboard/tunnel/movie/${id}/${loc}`;

  cy.visit(path, {timeout: 150 * SEC});
  cy.wait(10 * SEC);
  acceptCookie();
}

describe.skip('User can navigate to the movie tunnel pages start and main.', () => {
  // Log in and create a new movie
  it('User logs in, can navigate to add new title page', () => {
    clearDataAndPrepareTest('/');
    signInAndNavigateToMain(users[0], debugMovieId);
  });

  //Summary - Verification
  it('Fill all fields & navigate to Summary Page', () => {
    cy.wait(2 * SEC);
    cy.get('h1', {timeout: 180 * SEC})
      .contains('Production');

    cy.url().then(url => {
      cy.log(`Adding new movie url: ${url}`);
      console.log("movie :", url);
    });

    const skipSteps = getStepsToSkip(Movie);

    testSteps.forEach(step => {
      if (skipSteps.includes(step.title)) {
        return;
      }

      if (!debug_mode || (debug_mode && step.debug)) {
        //Fill the form for this step..
        cy.log(`=> Step : [${step.title}]`);
        cy.get('h1', {timeout: 3 * SEC}).contains(step.title);
        // TODO : if test is kept, don't use setForm
        //setForm(step.selector, {inputValue: Movie[step.input]});

        //If there are component saves, click them..
        step.comp_save.forEach(comp => {
          cy.get(`button[test-id=${comp}]`).each(el => {
            cy.wrap(el).click();
            cy.wait(800);
          });
        })

        //Save this step
        if (step.save_form) {
          cy.get('button[test-id="tunnel-step-save"]', {timeout: 3 * SEC})
            .click();
          cy.wait(1 * SEC);
        }
      }
      //Proceed to next step.
      cy.get('a[test-id="next"]', {timeout: 3 * SEC})
        .click();
      cy.wait(1 * SEC);
    });

    cy.log('=>Reach Summary Page');
  });

  //Verify Summary sheet fields are correct
  it('Verify fields in Summary Page', () => {
    //Uncomment next line to debug summary fields of movie
    //debugMovieTitle('Nc5uECQYauv3u9xUFSib', 'summary');

    cy.log('[Summary Page]: Check for mandatory and missing fields');
    cy.get('h1', {timeout: 15 * SEC}).contains('Summary & Submission');

    MovieFormSummary.forEach(section => {
      //If debug_mode is on and section is debug: false, then skip
      if (debug_mode && !section.debug) {
        //skip this section
        return;
      }

      cy.log(`=>[${section.title}]`);
      cy.get(section.selector).each(el => {
        console.log(el);
        const key = el.attr('test-id');
        cy.wrap(el).contains(section.input[key]);
      })
    })
  });

  it('Publish the movie to the market', () => {
    //Note : to debug only publish you can uncomment the following:
    //debugMovieTitle(debugMovieId, 'summary');

    //After filling all required fields, movie can be published.
    cy.log('[Summary Page]: Publish the movie');
    cy.get('button[test-id=publish]')
      .click();

    cy.log('Reach Festival Title View Page');
    cy.get('festival-dashboard-title-view h1', {timeout: 60 * SEC})
      .contains(Movie.mainInfo["international-title"]);
  });

  it('checks published movie is listed', () => {
    cy.log('Navigate to My Titles page');
    cy.get(`festival-dashboard button[test-id="menu"]`, {timeout: 3 * SEC})
      .first().click();
    clickOnMenu(['festival-dashboard', 'festival-dashboard'], 'menu', 'title');
    cy.wait(1 * SEC);

    cy.get('festival-dashboard-title-list h1', {timeout: 60 * SEC})
      .contains('My Titles');

    //Search the movie
    cy.get('input[test-id="filter-input"]', {timeout: 60 * SEC})
      .type(Movie.mainInfo["international-title"]);

    //After filling all required fields, movie can be published.
    cy.get('table tr').each(($e) => {
      const row = cy.wrap($e);
      row.get('td:nth-child(1)').contains(Movie.mainInfo["international-title"]);
      row.get('td:nth-child(5)').contains('Accepted');
    });
  });
});
