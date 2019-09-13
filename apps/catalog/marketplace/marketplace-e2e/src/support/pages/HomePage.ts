import NavbarPage from './NavbarPage';
import SearchPage from './SearchPage';

export default class HomePage extends NavbarPage {
  constructor() {
    super();
  }

  public clickDiscover() {
    cy.get('[page-id=catalog-homepage] a[test-id=discover]').click();
    return new SearchPage();
  }
}
