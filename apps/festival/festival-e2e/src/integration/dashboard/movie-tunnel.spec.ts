/// <reference types="cypress" />

import { clearDataAndPrepareTest, setForm } from '@blockframes/e2e/utils/functions';
import { signInAndNavigateToMain } from '../../support/utils/utils';
//TODO: Cleanup
//import { mainTest } from '../../support/movie-tunnel-tests';
import { User, USER } from '@blockframes/e2e/fixtures/users';
import { TO } from '@blockframes/e2e/utils';

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
    "synopsis": 'I saw this film at the Stockholm Film festival. Before watching I read some reviews on other websites and found criticisms for the lack of depth and how much you really get to know the man. Well I was pleasantly surprised. You don\'t get to know his childhood story and how he became such an icon, but what you do get is a glimpse into his world and some of his philosophies. I actually preferred this rather than knowing in what year he did this or why he did that. He has a tremendous grip on life and there is a good chance you will walk away after watching this film and reflect on some of his insights.\nThe shots are interesting and the pace of the movie is excellent. I was not bored. The only disappointing thing was how abruptly the movie finished.\nOverall very good though.',
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
    "cast-description": 'Elegant Nicole Kidman, known as one of Hollywood\'s top Australian imports, was actually born in Honolulu, Hawaii, while her Australian parents were there on educational visas. Kidman is the daughter of Janelle Ann (Glenny), a nursing instructor, and Antony David Kidman, a biochemist and clinical psychologist.',
    "cast-film1": 'Bombshell',
    "cast-year1": '2018',    
    "crew-first-name": 'Karl',
    "crew-last-name": 'Lagerfeld',
    "crew-role": 'Costume Designer',
    "crew-status": 'Confirmed',
    "crew-description": 'Karl Lagerfeld was born on September 10, 1933 in Hamburg, Germany as Karl Otto Lagerfeldt. He was a costume designer and actor, known for The Tale of a Fairy (2011), The Return (2013) and Reincarnation (2014). He died on February 19, 2019 in Neuilly-sur-Seine, Hauts-de-Seine, France.',
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
    "description": 'Lagerfeld Confidential was created with a delicate balance between comedy and drama. It analyzes the life of Lea, a woman in her early 30\’s, who has been heavily influenced by pop culture since childhood.',
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
    "teaserLink": 'https://www.youtube.com/watch?v=ZZDWGlZmrjI&list=RDAPkHkrk9Eew',
    "trailerLink": 'https://www.youtube.com/watch?v=ZZDWGlZmrjI&list=RDAPkHkrk9Eew',
    "promoReelLink": 'https://www.youtube.com/watch?v=ZZDWGlZmrjI&list=RDAPkHkrk9Eew',
    "screenerLink": 'https://www.youtube.com/watch?v=ZZDWGlZmrjI&list=RDAPkHkrk9Eew',
    "clipLink": 'https://www.youtube.com/watch?v=ZZDWGlZmrjI&list=RDAPkHkrk9Eew',
    "otherLinkName": 'Best Scene',
    "otherLinkUrl": 'https://www.youtube.com/watch?v=ZZDWGlZmrjI&list=RDAPkHkrk9Eew'
  }
}

const testSteps = [
  {title: 'Production Status', selector: 'movie-form-title-status mat-radio-button', 
    input: 'productionStatus', has_upload: false},  
  {title: 'Main Information', selector: 'movie-form-main input, static-select, chips-autocomplete', 
    input: 'mainInfo', has_upload: false},
  {title: 'Storyline Elements', selector: 'movie-form-story-elements textarea, input', 
    input: 'storyElements', has_upload: false},
  {title: 'Production Information', selector: 'movie-form-production input, mat-select, chips-autocomplete', 
    input: 'production', has_upload: false},
  {title: 'Artistic Team', selector: 'movie-form-artistic input, textarea, static-select', 
    input: 'artisticTeam', has_upload: false},
  {title: 'Selection & Reviews', selector: 'movie-form-reviews static-select, input, textarea', 
    input: 'reviews', has_upload: false},
  {title: 'Additional Information', selector: 'movie-form-additional-information input, mat-button-toggle, form-country, movie-form-budget-range, static-select', 
    input: 'additionalInfo', has_upload: false},
  {title: 'Shooting Information', selector: 'movie-shooting-information mat-radio-button, static-select, input', 
    input: 'shootingInformation', has_upload: false},
  {title: 'Technical Specification', selector: 'movie-form-technical-info static-select', 
    input: 'techSpec', has_upload: false},
  {title: 'Available Materials', selector: 'movie-form-available-materials mat-slide-toggle, input', 
    input: 'availableMaterials', has_upload: false},
  {title: 'Sales Pitch', selector: 'movie-form-sales-pitch textarea, input, mat-select', 
    input: 'salesPitch', has_upload: false},
  {title: 'Files', selector: 'movie-form-media-files file-upload', 
    input: 'files', has_upload: false},
  {title: 'Notes and Statements', selector: 'movie-form-media-notes input, mat-select, file-upload', 
    input: 'notesStatements', has_upload: false},
  {title: 'Promotional Elements', selector: 'movie-form-media-images', 
    input: 'promoElements', has_upload: false},
  {title: 'Videos', selector: 'movie-form-media-videos textarea, input', 
    input: 'videos', has_upload: false}
];

describe('User can navigate to the movie tunnel pages start and main.', () => {
  // Log in and create a new movie
  it('User logs in, can navigate to add new title page', () => {
    clearDataAndPrepareTest('/');
    signInAndNavigateToMain(users[0]);

    cy.url().then(url => {
      cy.log(`Adding new movie url: ${url}`);
      movieURL = url;
    });

  });

  //Summary - Verification
  it('Fill all fields and verify it in Summary Page', () => {
    //TODO: Refactor to remove maintest & URL hard-coding.
    //mainTest();
    //cy.visit('http://localhost:4200/c/o/dashboard/tunnel/movie/1dPPD8KtuGqvQcAytVWx/main');
    //cy.wait(3000);
    //acceptCookie();

    testSteps.forEach(step => {
      cy.log(`=> Step : [${step.title}]`);
      cy.get('h1', {timeout: TO.PAGE_ELEMENT}).contains(step.title);
      setForm(step.selector, {inputValue: Movie[step.input]});
      cy.get('button[test-id="tunnel-step-save"]', {timeout: TO.PAGE_ELEMENT})
        .click();
      cy.wait(TO.WAIT_1SEC);

      //Proceed to next step.
      cy.get('a[test-id="next"]', {timeout: TO.PAGE_ELEMENT})
        .click();
    });

    cy.log('[Summary Page]: Check for mandatory and missing fields');
    cy.get('h1', {timeout: TO.FIFTEEN_SEC}).contains('Summary Page');

    cy.log('[Summary - Main fields]');
    cy.get('#main-information [test-id]').each(el => {
      console.log(el);
      const key = el.attr('test-id');
      cy.wrap(el).contains(Movie.mainInfo[key])      
    })

  });

});
