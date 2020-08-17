import { LandingPage } from '../../support/pages/landing';
import { HomePage } from '../pages/marketplace';
import { TitlesListPage, StartTunnelPage, TunnelMainPage } from '../pages/dashboard';
import { User } from '@blockframes/e2e/utils/type';
import { USERS } from '@blockframes/e2e/utils/users';
import { signIn } from '@blockframes/e2e/utils/functions';

// Select user: david.ewing@gillespie-lawrence.fake.cascade8.com
const LOGIN_CREDENTIALS: Partial<User> = USERS[0];

export function signInAndNavigateToMain() {
  const p1 = new LandingPage();
  //Note: Here we click sign-up because inside signIn
  //we switchmode to Login.
  p1.clickSignup();   
  signIn(LOGIN_CREDENTIALS);
  const p3 = new HomePage();

  // Navigate to movie-tunnel-main
  const p4: TitlesListPage = TitlesListPage.navigateToPage();
  const p5: StartTunnelPage = p4.clickAdd();
  const p6: TunnelMainPage = p5.clickBegin();
}
