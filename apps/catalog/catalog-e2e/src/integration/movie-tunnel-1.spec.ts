/// <reference types="cypress" />

import { StartTunnelPage, TitlesPage } from "../support/pages";

// TEST

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/dashboard/titles')
  cy.viewport('ipad-2', 'landscape');
})

describe('User can navigate to the movie tunnel page 1 and 2', () => {
  it('Go on titles page, go to movie tunnel page 1, go on movie tunnel page 2', () => {
     const p1 = new TitlesPage();
     const p2: StartTunnelPage = p1.clickAdd();
     p2.clickBegin();
  });
});
