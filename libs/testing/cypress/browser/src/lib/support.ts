import {
  App,
  orgActivity,
  Organization,
  territories,
  PublicUser,
  Module,
  Territory,
  MediaGroup,
  TerritoryGroup,
} from '@blockframes/model';
import { browserAuth } from './browserAuth';
import { gmail } from './gmail';
import { gmail_v1 } from 'googleapis';
import { USER_FIXTURES_PASSWORD } from '@blockframes/devops';
import { sub } from 'date-fns';
import { dateToMMDDYYYY } from './helpers';

export function acceptCookies() {
  return cy.get('body').then($body => {
    if ($body.children('cookie-banner')) {
      cy.contains('Save preferences').click(); // Accept cookies
    }
  });
}

export function get(selector: string) {
  return cy.get(`[test-id="${selector}"]`);
}

export function snackbarShould(verb: 'not.exist' | 'contain', value?: string) {
  !value ? cy.get('snack-bar-container').should(verb) : cy.get('snack-bar-container').should(verb, value);
}

export function getByClass(selector: string) {
  return cy.get(`.${selector}`);
}

export function getAllStartingWith(selector: string) {
  return cy.get(`[test-id^="${selector}"]`);
}

export function findIn(parent: string, child: string) {
  return get(parent).find(`[test-id="${child}"]`);
}

export function check(selector: string) {
  return get(selector).find('[type="checkbox"]').check({ force: true });
}

export function uncheck(selector: string) {
  return get(selector).find('[type="checkbox"]').uncheck({ force: true });
}

export function assertUrl(url: string) {
  return cy.url().should('eq', `http://localhost:4200/${url}`);
}

export function assertUrlIncludes(partialUrl: string) {
  return cy.url().should('include', partialUrl);
}

export function assertTableRowData(row: number, strings: string[]) {
  return Promise.all(strings.map((string, index) => get(`row_${row}_col_${index}`).should('contain', string)));
}

export function assertMultipleTexts(selector: string, content: string[], previous?: Cypress.Chainable) {
  if (content.length <= 1 && !previous) throw new Error('assertMultipleTexts() needs more than one string');
  if (selector !== 'previous')
    return assertMultipleTexts('previous', content.slice(1), get(selector).should('contain', content[0]));
  if (content.length > 1) return assertMultipleTexts('previous', content.slice(1), previous.and('contain', content[0]));
  return previous.and('contain', content[0]);
}

export function assertInputValue(selector: string, expected: string) {
  return get(selector)
    .invoke('val')
    .then(val => expect(val).to.eq(expected));
}

export function interceptEmail(_query: string, twoMinutesLimit = true, loop = 0): Cypress.Chainable<gmail_v1.Schema$Message> {
  const timeStamp2MinutesAgo = sub(new Date(), { minutes: 2 }).getTime();
  const twoMinutesAgo = Math.floor(timeStamp2MinutesAgo / 1000); //to allow checking multiple emails from a single flow (ex: offers)
  const query = _query + (twoMinutesLimit ? ` after:${twoMinutesAgo}` : '');
  return gmail.queryEmails(query).then(emailsList => {
    if (!emailsList.length) {
      if (loop > 20) throw new Error(`No email found for the following query: ${_query} / time: ${new Date()}`);
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(interceptEmail(_query, twoMinutesLimit, loop + 1));
        }, 1000);
      });
    }
    return gmail.getEmail(emailsList[0].id);
  });
}

export function connectUser(email: string) {
  browserAuth.clearBrowserAuth();
  cy.visit('');
  browserAuth.signinWithEmailAndPassword(email);
  cy.visit('');
}

export const escapeKey = () => cy.get('body').type('{esc}');

//* AUTHENTIFICATION *//

export function fillCommonInputs(user: PublicUser, fillEmail = true) {
  if (fillEmail) ensureInput('email', user.email);
  get('first-name').type(user.firstName);
  get('last-name').type(user.lastName);
  get('password').type(USER_FIXTURES_PASSWORD);
  get('password-confirm').type(USER_FIXTURES_PASSWORD);
  check('terms');
  check('gdpr');
}

export function addNewCompany({ name, activity, addresses }: Organization) {
  get('org').type(name);
  get('new-org').click();
  get('activity').click();
  get(`activity_${activity}`).click();
  get('activity').should('contain', orgActivity[activity]);
  get('country').click();
  get(`option_${addresses.main.country}`).click();
  get('country').should('contain', territories[addresses.main.country]);
  get('role').contains('Buyer').click();
}

export function selectCompany(orgName: string) {
  get('org').type(orgName);
  get(`org_${orgName}`).click();
}

export function verifyInvitation(orgAdminEmail: string, user: PublicUser, expectedModule: Module, app: App) {
  browserAuth.signinWithEmailAndPassword(orgAdminEmail);
  cy.visit('');

  assertUrlIncludes(`${expectedModule}/home`);
  if (expectedModule === 'marketplace' && app === 'catalog') get('skip-preferences').click();
  get('invitations-link').click();
  get('invitation').first().should('contain', `${user.firstName} ${user.lastName} wants to join your organization.`);
  get('invitation-status').first().should('contain', 'Accepted');
}

export function ensureInput(input: string, value: string) {
  //response to flaky test where the email was sometimes missing the first caracters
  get(input).type(value);
  get(input)
    .invoke('val')
    .then(val => val !== value && get(input).clear().type(value));
}

//* ------------------------------------- *//

//* DASHBOARD *//

//this function is used during movie creation to validate each upload
//has they tend to fail in batch. See #9002
export function saveTitle(checkUploadWidget = false) {
  get('tunnel-step-save').click();
  snackbarShould('contain', 'Title saved');
  if (checkUploadWidget) {
    get('upload-widget').should('exist');
    get('upload-widget').should('not.exist');
  }
}

//* ------------------------------------- *//

//* MAINTENANCE *//

export function refreshIfMaintenance(app: App) {
  return cy.get(`${app}-root`).then($el => {
    const $children = $el.children();
    const childrenTagNames = $children.toArray().map(child => child.tagName);
    if (childrenTagNames.includes('blockframes-maintenance'.toUpperCase())) get('maintenance-refresh').click();
  });
}

//* ------------------------------------- *//

//* CATALOG AVAILS *//

export function selectTerritories(territory: Territory | TerritoryGroup) {
  get('territories').click();
  get(territory).click('left');
  escapeKey();
}

export function selectMedias(mediaGroup: MediaGroup) {
  get('medias').click();
  get(mediaGroup).click('left');
  escapeKey();
}

export function selectDates(from: Date, to: Date) {
  get('dateFrom').should('be.enabled');
  get('dateTo').should('be.enabled');
  get('dateFrom').clear().type(dateToMMDDYYYY(from));
  get('dateTo').clear().type(dateToMMDDYYYY(to));
}

export function selectNonExclusive() {
  get('exclusivity').click();
  get('non-exclusive').click();
}

export function selectExclusive() {
  get('exclusivity').click();
  get('exclusive').click();
}
