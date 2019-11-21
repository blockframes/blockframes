/// <reference types="cypress" />
import { LandingPage, setupForMacbook } from '../support';

beforeEach(() => {
  setupForMacbook();
});

describe('story 2: Je peux me connecter et créer un Film', () => {
  it.skip('', () => {
    let p: any = new LandingPage();

    // User Story creation of a film begins here
    p = p.clickNewMovie();
    p.fillTitle('Akira 2');
    p.selectGenre('Action');
    p.selectStatus('Financing');
    p.fillLogline(
      'A secret military project endangers Neo-Tokyo when it turns a biker gang member into a rampaging psychic psychopath that only two teenagers and a group of psychics can stop.'
    );

    p = p.submitForm();
    p.findMovieItemByTitle('Akira 2');
  });
});
