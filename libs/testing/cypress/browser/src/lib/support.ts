import { OrgActivity, Territory, PublicUser, Module } from '@blockframes/model';
import { browserAuth } from '@blockframes/testing/cypress/browser';
import { startOfWeek, add, isPast, isFuture } from 'date-fns';
import { USER_FIXTURES_PASSWORD } from '@blockframes/devops';
import { serverId } from '@blockframes/utils/constants';

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
  cy.get('body').then($body => {
    if ($body.children('cookie-banner')) {
      cy.contains('Accept Cookies').click();
    }
  });
}

export function get(selector: string) {
  return cy.get(`[test-id="${selector}"]`);
}

export function getByClass(selector: string) {
  return cy.get(`.${selector}`);
}

export function getAllStartingWith(selector: string) {
  return cy.get(`[test-id^="${selector}"]`);
}

export function getInList(selectorStart: string, option: string) {
  getAllStartingWith(selectorStart).each($el => {
    // loops between all options
    if ($el[0].innerText === option) $el.trigger('click');
  });
}

export function check(selector: string) {
  get(selector).find('[type="checkbox"]').check({ force: true });
}

export function uncheck(selector: string) {
  get(selector).find('[type="checkbox"]').uncheck({ force: true });
}

export function assertUrl(url: string) {
  cy.url().should('eq', `http://localhost:4200/${url}`);
}

export function assertUrlIncludes(partialUrl: string) {
  cy.url().should('include', partialUrl);
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
  getInList('country_', country);
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

//* DASHBOARD *//

export function createFutureSlot() {
  const slot: EventSlot = { day: 0, hours: 0, minutes: 0 };
  do {
    slot.day = new Date().getDay() + Math.floor(Math.random() * (7 - new Date().getDay()));
    slot.hours = Math.floor(Math.random() * 24);
    slot.minutes = Math.random() < 0.5 ? 0 : 30;
  } while (!isFuture(add(startOfWeek(new Date()), { days: slot.day, hours: slot.hours, minutes: slot.minutes })));
  return slot;
}

// not used yet, need to wait for issue #8203 to be resolved
export function createPastSlot() {
  const slot: EventSlot = { day: 0, hours: 0, minutes: 0 };
  do {
    slot.day = Math.floor(Math.random() * new Date().getDay());
    slot.hours = Math.floor(Math.random() * 24);
    slot.minutes = Math.random() < 0.5 ? 0 : 30;
  } while (!isPast(add(startOfWeek(new Date()), { days: slot.day, hours: slot.hours, minutes: slot.minutes })));
  return slot;
}

export function getCurrentWeekDays() {
  const d = new Date();
  const weekDays: { day: string; date: string }[] = [];
  d.setDate(d.getDate() - d.getDay());
  for (let i = 0; i < 7; i++) {
    weekDays.push({
      day: d.toLocaleString('en-us', { weekday: 'long' }),
      date: `${new Date(d).toLocaleString('en-us', { month: 'short' })} ${new Date(d).getDate()}`,
    });
    d.setDate(d.getDate() + 1);
  }
  return weekDays;
}

export interface EventSlot {
  day: number;
  hours: number;
  minutes: 0 | 30;
}

//* ------------------------------------- *//

//* MAINTENANCE *//

export function refreshIfMaintenance() {
  cy.get('festival-root').then($el => {
    const $children = $el.children();
    const childrenTagNames = $children.toArray().map(child => child.tagName);
    if (childrenTagNames.includes('blockframes-maintenance'.toUpperCase())) get('maintenance-refresh').click();
  });
}

//* ------------------------------------- *//
