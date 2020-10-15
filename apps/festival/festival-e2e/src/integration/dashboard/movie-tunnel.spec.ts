/// <reference types="cypress" />

import { clearDataAndPrepareTest, setForm, FormOptions, 
         acceptCookie, uploadFile, createFakeScript, randomID } from '@blockframes/e2e/utils/functions';
import { signInAndNavigateToMain } from '../../support/utils/utils';
import { mainTest } from '../../support/movie-tunnel-tests';
import { User, USER } from '@blockframes/e2e/fixtures/users';
import { TO } from '@blockframes/e2e/utils';

const userFixture = new User();
const users = [ userFixture.getByUID(USER.Jean) ];
let movieURL: string;

const Movie = {
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
  additionalInfo: {
    "release-country": 'World',
    "release-media": 'N-VOD',
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
  notesStatements: {
    "intent-note": JSON.stringify({type: 'app/pdf', filename: '1234.pdf'})
  }
}

const testSteps = [
  {title: 'Main Information', selector: '', 
    input: 'mainInfo', has_upload: false},
  {title: 'Main Information', selector: '', 
    input: 'mainInfo', has_upload: false},
  {title: 'Main Information', selector: '', 
    input: 'mainInfo', has_upload: false},
  {title: 'Main Information', selector: '', 
    input: 'mainInfo', has_upload: false},
]

describe('User can navigate to the movie tunnel pages start and main.', () => {
  // Log in and create a new movie
  it('User logs in, can navigate to add new title page', () => {
    clearDataAndPrepareTest('/');
    signInAndNavigateToMain(users[0]);

    cy.url().then(url => {
      cy.log(`Adding new movie url: ${url}`);
      movieURL = url;
    });

    testSteps.forEach(step => {
      cy.get('h1', {timeout: 30000}).contains(step.title);
      setForm(step.selector, {inputValue: Movie[step.input]});
      if (step.has_upload) {
        //Click on Save button.
      }
      //Proceed to next step.
      cy.get('', {timeout: TO.PAGE_ELEMENT})
        .click();
    });

    //On Summary page, verify the details.
  });

  //Summary - Verification
  it.only('Complete Notes, go on Promotions', () => {
    //mainTest();
    cy.visit('http://localhost:4200/c/o/dashboard/tunnel/movie/1dPPD8KtuGqvQcAytVWx/summary');
    cy.wait(3000);
    acceptCookie();
    cy.get('h1', {timeout: 30000}).contains('Summary Page');
    // const formOpt: FormOptions = {
    //   inputValue: Movie.notesStatements
    // }

  });  

  // Notes & Statements
  it.skip('Complete Notes, go on Promotions', () => {
    //mainTest();
    cy.visit('http://localhost:4200/c/o/dashboard/tunnel/movie/1dPPD8KtuGqvQcAytVWx/media-notes');
    cy.wait(3000);
    acceptCookie();
    cy.get('h1', {timeout: 30000}).contains('Notes and Statements');
    const formOpt: FormOptions = {
      inputValue: Movie.notesStatements
    }
    //setForm('movie-form-media-notes mat-radio-button, static-select, input', formOpt);
    setForm('movie-form-media-notes file-upload', formOpt);
    // createFakeScript(`${randomID()}`).then(path => {
    //   uploadFile(path, 'application/pdf', 'intent-note');
    // });
  });

  // Shooting Information
  it.skip('Complete Shooting Information, go on movie tunnel storyline page', () => {
    //mainTest();
    cy.visit('http://localhost:4200/c/o/dashboard/tunnel/movie/1dPPD8KtuGqvQcAytVWx/shooting-information');
    cy.wait(3000);
    acceptCookie();
    cy.get('h1', {timeout: 30000}).contains('Shooting Information');
    const formOpt: FormOptions = {
      inputValue: Movie.shootingInformation
    }
    setForm('movie-shooting-information mat-radio-button, static-select, input', formOpt);
  });

  // Storyline Elements
  it.skip('Complete Technical Specs, go on movie tunnel storyline page', () => {
    //mainTest();
    cy.visit('http://localhost:4200/c/o/dashboard/tunnel/movie/1dPPD8KtuGqvQcAytVWx/story-elements');
    cy.wait(3000);
    acceptCookie();
    cy.get('h1', {timeout: 30000}).contains('Storyline Elements');
    const formOpt: FormOptions = {
      inputValue: Movie.storyElements
    }
    setForm('movie-form-story-elements textarea, input', formOpt);
  });

  // Available Materials
  it.skip('Complete Technical Specs, go on movie tunnel storyline page', () => {
    //mainTest();
    cy.visit('http://localhost:4200/c/o/dashboard/tunnel/movie/1dPPD8KtuGqvQcAytVWx/available-materials');
    cy.wait(3000);
    acceptCookie();
    cy.get('h1', {timeout: 30000}).contains('Available Materials');
    const formOpt: FormOptions = {
      inputValue: Movie.availableMaterials
    }
    setForm('movie-form-available-materials mat-slide-toggle, input-autocomplete', formOpt);
  });

  // Additional Information
  it.skip('Complete Technical Specs, go on movie tunnel storyline page', () => {
    //mainTest();
    cy.visit('http://localhost:4200/c/o/dashboard/tunnel/movie/1dPPD8KtuGqvQcAytVWx/additional-information');
    cy.wait(3000);
    acceptCookie();
    cy.get('h1', {timeout: 30000}).contains('Additional Information');
    const formOpt: FormOptions = {
      inputValue: Movie.additionalInfo
    }
    setForm('movie-form-additional-information input, mat-button-toggle, form-country, movie-form-budget-range, static-select', formOpt);
  });

  // Technical Spec
  it.skip('Complete Technical Specs, go on movie tunnel storyline page', () => {
    //mainTest();
    cy.visit('http://localhost:4200/c/o/dashboard/tunnel/movie/1dPPD8KtuGqvQcAytVWx/technical-spec');
    cy.wait(3000);
    acceptCookie();
    cy.get('h1', {timeout: 30000}).contains('Technical Specification');
    const formOpt: FormOptions = {
      inputValue: Movie.techSpec
    }
    setForm('movie-form-technical-info static-select', formOpt);
  });

  // Artistic Team
  it.skip('Complete main fields, go on movie tunnel storyline page', () => {
    //mainTest();
    cy.visit('http://localhost:4200/c/o/dashboard/tunnel/movie/1dPPD8KtuGqvQcAytVWx/artistic');
    cy.wait(3000);
    acceptCookie();
    cy.get('h1', {timeout: 30000}).contains('Artistic Team');
    const formOpt: FormOptions = {
      inputValue: Movie.artisticTeam
    }
    setForm('movie-form-artistic input, textarea, static-select', formOpt);
  });

  // Production page
  it.skip('Complete main fields, go on movie tunnel storyline page', () => {
    //mainTest();
    cy.visit('http://localhost:4200/c/o/dashboard/tunnel/movie/1dPPD8KtuGqvQcAytVWx/production');
    cy.wait(3000);
    acceptCookie();
    cy.get('h1', {timeout: 30000}).contains('Production Information');
    const formOpt: FormOptions = {
      inputValue: Movie.production
    }    
    setForm('movie-form-production input, mat-select, chips-autocomplete', formOpt);
  });

  it.skip('Complete main fields, go on movie tunnel storyline page', () => {
    //mainTest();
    cy.visit('http://localhost:4200/c/o/dashboard/tunnel/movie/1dPPD8KtuGqvQcAytVWx/main');
    cy.wait(3000);
    acceptCookie();
    cy.get('h1', {timeout: 30000}).contains('Main Information');
    const formOpt: FormOptions = {
      inputValue: Movie.mainInfo
    }    
    setForm('movie-form-main input, static-select, chips-autocomplete', formOpt);
  });  
});
