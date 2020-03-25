/// <reference types="cypress" />

import { clearDataAndPrepareTest } from '@blockframes/e2e/utils/utils';
import { signInAndNavigateToMain } from '../../support/utils/utils';

beforeEach(() => {
  clearDataAndPrepareTest();
});

describe('User can navigate to the movie tunnel page 1 and 2', () => {
  it('Login into an existing account, navigate on titles list page, go to movie tunnel page 1, go on movie tunnel page 2', () => {
    signInAndNavigateToMain();
  });
});
