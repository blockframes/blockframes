import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import HomePage from './HomePage';
import SearchPage from './SearchPage'
import ViewPage from './ViewPage';
import DistributionPage from './DistributionPage';
import SelectionPage from './SelectionPage';
import FeedbackPage from './FeedbackPage';

export default abstract class NavbarPage {
  constructor() {
    cy.get('[page-id=navbar]', { timeout: 10000 });
  }

  public openProfileMenu(){
    cy.get('[page-id=navbar] button[test-id=profile-avatar]').click();
  }

  public clickLogout() {
    cy.get('button[test-id=logout]').click();
  }
}
