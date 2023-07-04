import {
  browserAuth,
  gmail,
  maintenance,
  // cypress commands
  get,
  check,
  // cypress tasks
  interceptEmail,
  // fixture data
  fakeUserData,
  getTextBody,
} from '@blockframes/testing/cypress/browser';
import { e2eSupportEmail } from '@blockframes/utils/constants';

const user = fakeUserData();

describe('Demo Request Email', () => {
  beforeEach(() => {
    cy.visit('');
    maintenance.start();
    browserAuth.clearBrowserAuth();
    maintenance.end();
    cy.visit('');
  });

  it('Request demo email', () => {
    get('first-name').type(user.firstName);
    get('last-name').type(user.lastName);
    get('company').type(user.company.name);
    get('role').click();
    get(`role_${user.role}`).click();
    get('demo-email').type(user.email);
    get('phone').children().children().as('phoneInputs');
    cy.get('@phoneInputs').first().type(user.indicator);
    cy.get('@phoneInputs').last().type(user.phone);
    check('checkbox-newsletters');
    get('submit-demo-request').click();
    interceptEmail(`to:${e2eSupportEmail}`).then(mail => {
      const body = getTextBody(mail);
      expect(body).to.include(user.email);
      gmail.deleteEmail(mail.id);
    });
  });
});
