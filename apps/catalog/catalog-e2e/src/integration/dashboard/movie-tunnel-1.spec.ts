/// <reference types="cypress" />

import { StartTunnelPage, TitlesListPage, TunnelMainPage } from '../../support/pages/dashboard';
import { HomePage } from '../../support/pages/marketplace';
import { User } from '../../support/utils/type';
import { USERS } from '../../support/utils/users';
import { LoginViewPage, WelcomeViewPage } from '../../support/pages/auth';
import { clearDataAndPrepareTest } from '../../support/utils/utils';

// TEST

// Select user: cytest@blockframes.com
const LOGIN_CREDENTIALS: Partial<User> = USERS[0];

beforeEach(() => {
  clearDataAndPrepareTest();
});

describe('User can navigate to the movie tunnel page 1 and 2', () => {
  it('Login into an existing account, navigate on titles list page, go to movie tunnel page 1, go on movie tunnel page 2', () => {
    // Connexion
    const p1: WelcomeViewPage = new WelcomeViewPage();
    const p2: LoginViewPage = p1.clickCallToAction();
    p2.switchMode();
    p2.fillSignin(LOGIN_CREDENTIALS);
    const p3: HomePage = p2.clickSignIn();

    // Navigate to movie-tunnel-1
    const p4: TitlesListPage = TitlesListPage.navigateToPage();
    const p5: StartTunnelPage = p4.clickAdd();
    const p6: TunnelMainPage = p5.clickBegin();
  });
});
