/// <reference types="cypress" />

import { clearDataAndPrepareTest, setForm, testPromise } from '@blockframes/e2e/utils/functions';
import { signInAndNavigateToMain } from '../../support/utils/utils';
import { User, USER } from '@blockframes/e2e/fixtures/users';
import { TO } from '@blockframes/e2e/utils';
import { acceptCookie, signIn, selectAction, clickOnMenu } from '@blockframes/e2e/utils/functions';

const userFixture = new User();
const users = [ userFixture.getByUID(USER.Jean) ];
let movieURL: string;

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
    "director-desc": 'Rodolphe Marconi was born on September 4, 1976 in Paris, France.',
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
    "release-country": 'United States of America (the)',
    "release-media": 'Video',
    "boxoffice-territory": 'France',
    "release-date": '01/01/2020',
    "budget-range": '$10 - 20 millions',
    "address-country": 'France',
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
  availableMaterials: {
    "languages": 'English',
    "original-version": false,
  },
  salesPitch : {
    "description": 'Lagerfeld Confidential was created with a delicate balance between comedy and drama.',
    //"target-audience": '',
    //"goal": ''
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
    "teaserLink": 'https://www.youtube.com/watch?v=1',
    "trailerLink": 'https://www.youtube.com/watch?v=2',
    "promoReelLink": 'https://www.youtube.com/watch?v=3',
    "screenerLink": 'https://www.youtube.com/watch?v=4',
    "clipLink": 'https://www.youtube.com/watch?v=5',
    "otherLinkName": 'Best Scene',
    "otherLinkUrl": 'https://www.youtube.com/watch?v=6'
  }
}

let val = Movie.production;
val['prod-co-summary'] = `${val['production-country'].toLowerCase()} ${val['production-company-name']}`;
val['coprod-co-summary'] = `${val['co-production-country'].toLowerCase()} ${val['co-production-company-name']}`;
val['producer-summary'] = `${val['producer-role'].toLowerCase()} ${val['first-name']} ${val['last-name']}`;
val['distributor-summary'] = `${val['distribution-country'].toLowerCase()} ${val['distribution-company-name']}`;
val['salesAgent-summary'] = `${val['sales-country'].toLowerCase()} ${val['sales-agent-name']}`;

const testSteps = [
  {title: 'Production Status', selector: 'movie-form-title-status mat-radio-button', 
    input: 'productionStatus', comp_save: [], save_form: false},  
  {title: 'Main Information', selector: 'movie-form-main input, static-select, chips-autocomplete', 
    input: 'mainInfo', comp_save: [], save_form: false},
  {title: 'Storyline Elements', selector: 'movie-form-story-elements textarea, input', 
    input: 'storyElements', comp_save: [], save_form: false},
  {title: 'Production Information', selector: 'movie-form-production input, static-select, mat-select, chips-autocomplete', 
    input: 'production', comp_save: ['row-save'], save_form: false}, 
  {title: 'Artistic Team', selector: 'movie-form-artistic input, textarea, static-select', 
    input: 'artisticTeam', comp_save: ['table-save'], save_form: false},
  {title: 'Selection & Reviews', selector: 'movie-form-reviews static-select, input, textarea', 
    input: 'reviews', comp_save: [], save_form: false},
  {title: 'Additional Information', selector: 'movie-form-additional-information input, mat-button-toggle, form-country, movie-form-budget-range, static-select', 
    input: 'additionalInfo', comp_save: [], save_form: false},
  {title: 'Shooting Information', selector: 'movie-shooting-information mat-radio-button, static-select, input', 
    input: 'shootingInformation', comp_save: [], save_form: false},
  {title: 'Technical Specification', selector: 'movie-form-technical-info static-select', 
    input: 'techSpec', comp_save: [], save_form: false},
  {title: 'Available Materials', selector: 'movie-form-available-materials mat-slide-toggle, input', 
    input: 'availableMaterials', comp_save: [], save_form: false},
  {title: 'Sales Pitch', selector: 'movie-form-sales-pitch textarea, input, mat-select', 
    input: 'salesPitch', comp_save: [], save_form: false},
  {title: 'Files', selector: 'movie-form-media-files file-upload', 
    input: 'files',  comp_save: [], save_form: false},
  {title: 'Notes and Statements', selector: 'movie-form-media-notes input, mat-select, file-upload', 
    input: 'notesStatements', comp_save: [], save_form: false},
  {title: 'Promotional Elements', selector: 'movie-form-media-images', 
    input: 'promoElements', comp_save: [], save_form: false},
  {title: 'Videos', selector: 'movie-form-media-videos textarea, input', 
    input: 'videos', comp_save: [], save_form: false}
];

const MovieFormSummary = [
  {title: 'Main Information', selector: '#main-information [test-id]', 
    input: Movie.mainInfo },
  {title: 'Production Information', selector: '#production-information [test-id]', 
    input: Movie.production },
];

describe('User can navigate to the movie tunnel pages start and main.', () => {
  // Log in and create a new movie
  it('User logs in, can navigate to add new title page', () => {
    clearDataAndPrepareTest('/');
    signInAndNavigateToMain(users[0]);
  });

  //Summary - Verification
  it('Fill all fields & navigate to Summary Page', () => {
    //cy.visit('http://localhost:4200/c/o/dashboard/tunnel/movie/1dPPD8KtuGqvQcAytVWx/title-status');
    //cy.wait(3000);
    //acceptCookie();

    cy.wait(TO.FIFTEEN_SEC);
    cy.url().then(url => {
      cy.log(`Adding new movie url: ${url}`);
      movieURL = url;
      console.log("movie :", url);
    });

    cy.get('h1', {timeout: TO.VSLOW_UPDATE}).contains('Production Status');

    testSteps.forEach(step => {
      cy.log(`=> Step : [${step.title}]`);
      cy.get('h1', {timeout: TO.PAGE_ELEMENT}).contains(step.title);
      setForm(step.selector, {inputValue: Movie[step.input]});

      //cy.pause();
      //If there are component saves, click them..
      step.comp_save.forEach(comp => {
        cy.get(`button[test-id=${comp}]`).each(el => {
          cy.wrap(el).click();
          cy.wait(800);
        });

      })

      //Save this step
      if (step.save_form) {
        cy.get('button[test-id="tunnel-step-save"]', {timeout: TO.PAGE_ELEMENT})
          .click();
        cy.wait(TO.WAIT_1SEC);
      }

      //Proceed to next step.
      cy.get('a[test-id="next"]', {timeout: TO.PAGE_ELEMENT})
        .click();
      cy.wait(TO.WAIT_1SEC);
    });

    cy.log('=>Reach Summary Page');
  });

  //Verify Summary sheet fields are correct
  it('Verify fields in Summary Page', () => {
    //cy.visit('http://localhost:4200/c/o/dashboard/tunnel/movie/1dPPD8KtuGqvQcAytVWx/summary');
    //cy.wait(3000);

    cy.log('[Summary Page]: Check for mandatory and missing fields');
    cy.get('h1', {timeout: TO.FIFTEEN_SEC}).contains('Summary Page');

    MovieFormSummary.forEach(section => {
      cy.log(`=>[${section.title}]`);
      cy.get(section.selector).each(el => {
        console.log(el);
        const key = el.attr('test-id');
        cy.wrap(el).contains(section.input[key]);
      })
    })
  });

});
