import { LandingPage } from '../../support/pages/landing';
import { HomePage } from '../pages/marketplace';
import { TitlesListPage, StartTunnelPage, TunnelMainPage } from '../pages/dashboard';
import { User, USER } from '@blockframes/e2e/fixtures/users';
import { signIn } from '@blockframes/e2e/utils/functions';

const userFixture = new User();
const users  =  [ userFixture.getByUID(USER.Jean) ];

export function signInAndNavigateToMain() {
  const p1 = new LandingPage();
  // Note: Here we click sign-up because inside signIn
  // we switch mode to Login.
  p1.clickSignup();
  signIn(users[0]);
  const p3 = new HomePage();

  // Navigate to movie-tunnel-main
  const p4: TitlesListPage = TitlesListPage.navigateToPage();
  const p5: StartTunnelPage = p4.clickAdd();
  const p6: TunnelMainPage = p5.clickBegin();
}
