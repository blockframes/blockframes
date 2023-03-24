import {
  browserAuth,
  // cypress commands
  get,
  check,
  // cypress tasks
  interceptEmail,
  deleteEmail,
  // fixture data
  fakeUserData,
} from '@blockframes/testing/cypress/browser';
import { supportMailosaur } from '@blockframes/utils/constants';

const user = fakeUserData();

describe('Demo Request Email', () => {
  beforeEach(() => {
    cy.visit('');
    browserAuth.clearBrowserAuth();
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
    interceptEmail({ sentTo: supportMailosaur }).then(mail => deleteEmail(mail.id));
  });
});
