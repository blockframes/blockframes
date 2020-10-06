/// <reference types="cypress" />

import { clearDataAndPrepareTest } from '@blockframes/e2e/utils/functions';
import { signInAndNavigateToMain } from '../../support/utils/utils';
import {
  mainTest,
  storylineTest,
  creditsTest, budgetTest,
  technicalInfoTest,
  promotionalImagesTest,
  filesTest,
  chainOfTitlesTest,
  valuationTest,
  summaryTest
} from '../../support/movie-tunnel-tests';

//TODO: Issue: #3874 
// Need new movie form for Catalog App to rewrite the tests.
describe.skip('User can navigate to the movie tunnel pages start and main.', () => {
  // Log in and create a new movie
  it('Login into an existing account, navigate on titles list page, go to movie tunnel start page, go on movie tunnel main page', () => {
    clearDataAndPrepareTest('/');
    signInAndNavigateToMain();
  });

  // Main page
  it('Complete main fields, go on movie tunnel storyline page', () => {
    mainTest();
  });

  // Storyline page
  it('Complete storyline fields, go on movie tunnel credits page', () => {
    storylineTest();
  });

  // Credits page
  it('Complete credits fields, go on movie tunnel budget page', () => {
    creditsTest();
  });

  // Budget page
  it('Complete budget fields, go on movie tunnel technical info page', () => {
    budgetTest();
  });

  // Technical info page
  it('Complete technical info fields, go on movie tunnel promotional images page', () => {
    technicalInfoTest();
  });

  // Promotional images page
  it('Go on movie tunnel files page', () => {
    promotionalImagesTest();
  });

  // Files page
  it('Complete files and links fields, go on movie tunnel chain of titles page', () => {
    filesTest();
  });

  // Chain of titles pages
  it('Complete chain of titles fields, go on movie tunnel valuation page', () => {
    chainOfTitlesTest();
  });

  // Valuation page
  it('Complete valuation field, go on movie tunnel summary page', () => {
    valuationTest();
  });

  // Summary page
  it('Verifies that every field of summary page is matching the inputs, save and verify the movie is saved', () => {
    summaryTest();
    // Reload and relaunch test to make sure the movie has been saved
    cy.reload();
    summaryTest();
  });
});
