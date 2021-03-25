/// <reference types="cypress" />

import { clearDataAndPrepareTest } from '@blockframes/e2e/utils/functions';
import { LandingPage } from '../../support/pages/landing';
import { HomePage, SearchPage } from '../../support/pages/marketplace';
import { avails } from '@blockframes/e2e/fixtures/bucket';
import { User, USER } from '@blockframes/e2e/fixtures/users';
import { SEC } from "@blockframes/e2e/utils/env";

const userFixture = new User();
const user = userFixture.getByUID(USER.Camilla);

beforeEach(() => {
  clearDataAndPrepareTest('/');
  const p1 = new LandingPage();
  const p2 = p1.clickLogin();
  p2.fillSignin(user);
  p2.clickSignIn();
});

describe('Create a new bucket', () => {
  it('Log in, go to the library page and add movie to the bucket', () => {
    const p1 = new HomePage();
    p1.openSidenavMenuAndNavigate('library');
    const p2 = new SearchPage();
    cy.wait(3 * SEC);
    p2.fillAvailFilter(avails);
    cy.wait(3 * SEC);
    p2.addToBucket('Bigfoot Family');
    p2.addToBucket('GAZA MON AMOUR');
    // p1.openSidenavMenuAndNavigate('selection');
  });
});
