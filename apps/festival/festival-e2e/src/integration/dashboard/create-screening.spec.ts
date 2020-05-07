/// <reference types="cypress" />

import { signInAndNavigateToMain } from '../../support/utils/utils';
import { clearDataAndPrepareTest } from '@blockframes/e2e/utils/functions';
import EventPage from '../../support/pages/EventPage';

beforeEach(() => {
  clearDataAndPrepareTest();
  signInAndNavigateToMain();
});

describe('User create a screening', () => {
  it('User create a private screening taking place right now', () => {
    const p1 = new EventPage()
    p1.createNewEvent(new Date(), 'private screening now', 'screening', true, false);
  })
});