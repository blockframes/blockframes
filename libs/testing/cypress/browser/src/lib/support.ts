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
      cy.contains('Accept cookies').click();
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
  return cy.mailosaurGetMessage(serverId, option, { receivedAfter: now, timeout: 20000 });
}

export function deleteEmail(id: string) {
  return cy.mailosaurDeleteMessage(id);
}
