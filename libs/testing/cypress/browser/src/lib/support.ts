import {
  App,
  orgActivity,
  Organization,
  territories,
  PublicUser,
  Module,
  Event,
  EventTypes,
  AccessibilityTypes,
} from '@blockframes/model';
import { browserAuth } from './browserAuth';
import { firestore } from './firestore';
import { startOfWeek, add, isPast, isFuture } from 'date-fns';
import { USER_FIXTURES_PASSWORD } from '@blockframes/devops';
import { serverId } from '@blockframes/utils/constants';
import { capitalize } from '@blockframes/utils/helpers';

interface ScreeningVerification {
  title: string;
  accessibility: AccessibilityTypes;
  expected: boolean;
}

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

export function connectOtherUser(email: string) {
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

//* js functions

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

//* cypress commands

export function selectSlot({ day, hours, minutes }: EventSlot) {
  return cy
    .get('.cal-day-column')
    .eq(day)
    .find('.cal-hour')
    .eq(hours)
    .children()
    .eq(!minutes ? 0 : 1)
    .click();
}

export function getEventSlot({ day, hours, minutes }: EventSlot) {
  //30 minutes are 30px high, an hour 60px
  let topOffset = hours * 60;
  if (minutes === 30) topOffset += 30;
  return cy.get('.cal-day-column').eq(day).find('.cal-events-container').find(`[style^="top: ${topOffset}px"]`);
}

export function fillDashboardCalendarPopin({ type, title }: { type: EventTypes; title: string }) {
  get('event-type').click();
  get(`option_${type}`).click();
  get('event-title-modal').clear().type(title);
  get('more-details').click();
}

export function fillDashboardCalendarDetails({ movieId, title, accessibility, secret }: {
  movieId: string;
  title: string;
  accessibility: AccessibilityTypes;
  secret?: boolean;
}) {
  get('screening-title').click();
  get(`option_${movieId}`).click();
  get('description').type(`Description : ${title}`);
  get(accessibility).click();
  if (secret) check('secret');
  get('event-save').click();
}

export function verifyScreening({ title, accessibility, expected }: ScreeningVerification) {
  return firestore.queryData({ collection: 'events', field: 'title', operator: '==', value: title })
    .then(([dbEvent]: Event[]) => {
      get(`event_${dbEvent.id}`).should(expected ? 'exist' : 'not.exist');
      if (expected) get(`event_${dbEvent.id}`).should('contain', `${capitalize(accessibility)} Screening`);
  });
}

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
