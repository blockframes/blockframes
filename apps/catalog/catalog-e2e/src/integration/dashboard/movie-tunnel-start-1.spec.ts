/// <reference types="cypress" />

import { clearDataAndPrepareTest } from '@blockframes/e2e/utils/functions';
import { signInAndNavigateToMain } from '../../support/utils/utils';

beforeEach(() => {
  clearDataAndPrepareTest();
});

describe('User can navigate to the movie tunnel pages start and main.', () => {
  it('Login into an existing account, navigate on titles list page, go to movie tunnel start page, go on movie tunnel main page', () => {
    signInAndNavigateToMain();
  });
});
