import { OrgActivity, Territory, PublicUser, Module } from '@blockframes/model';
import { USER_FIXTURES_PASSWORD } from '@blockframes/devops';
import { serverId } from '@blockframes/utils/constants';
import { browserAuth } from './browserAuth';

export function awaitElementDeletion(selector: string, timeout?: number) {
  const settings = { timeout };
  if (timeout) {
    cy.get(selector).should('exist');
    cy.get(selector, settings).should('not.exist');
  } else {
    cy.get(selector).should('exist');
    cy.get(selector).should('not.exist');
  }
}

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

export function getAllStartingWith(selector: string) {
  return cy.get(`[test-id^="${selector}"]`);
}

export function getInList(selectorStart: string, option: string) {
  return getAllStartingWith(selectorStart).each($el => {
    // loops between all options
    if ($el[0].innerText === option) $el.trigger('click');
  });
}

export function getInListbox(option: string) {
  return cy
    .get('[role="listbox"]')
    .children()
    .each($child => {
      if ($child.text().includes(option)) {
        cy.wrap($child).click();
      }
    });
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

interface InterceptOption {
  sentTo?: string;
  subject?: string;
  body?: string;
}

export function interceptEmail(option: InterceptOption) {
  const now = new Date();
  return cy.mailosaurGetMessage(serverId, option, { receivedAfter: now, timeout: 30000 });
}

export function deleteEmail(id: string) {
  return cy.mailosaurDeleteMessage(id);
}

//* AUTHENTIFICATION *//

export function fillCommonInputs(user: PublicUser) {
  get('email').type(user.email);
  get('first-name').type(user.firstName);
  get('last-name').type(user.lastName);
  get('password').type(USER_FIXTURES_PASSWORD);
  get('password-confirm').type(USER_FIXTURES_PASSWORD);
  check('terms');
  check('gdpr');
}

export function addNewCompany(data: { name: string; activity: OrgActivity; country: Territory }) {
  const { name, activity, country } = data;
  get('org').type(name);
  get('new-org').click();
  get('activity').click();
  getInList('activity_', activity);
  get('activity').should('contain', activity);
  get('country').click();
  getInList('option_', country);
  get('country').should('contain', country);
  get('role').contains('Buyer').click();
}

export function selectCompany(orgName: string) {
  get('org').type(orgName);
  getInList('org_', orgName);
}

export function verifyInvitation(orgAdminEmail: string, user: PublicUser, expectedModule?: Module) {
  browserAuth.signinWithEmailAndPassword(orgAdminEmail);
  cy.visit('');

  assertUrlIncludes(`${expectedModule}/home`);
  if (expectedModule === 'marketplace') get('skip-preferences').click();
  get('invitations-link').click();
  get('invitation').first().should('contain', `${user.firstName} ${user.lastName} wants to join your organization.`);
  get('invitation-status').first().should('contain', 'Accepted');
}

//* ------------------------------------- *//

//* MAINTENANCE *//

export function refreshIfMaintenance() {
  return cy.get('festival-root').then($el => {
    const $children = $el.children();
    const childrenTagNames = $children.toArray().map(child => child.tagName);
    if (childrenTagNames.includes('blockframes-maintenance'.toUpperCase())) get('maintenance-refresh').click();
  });
}

//* ------------------------------------- *//
