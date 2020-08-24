import { auth, db, sentinel } from '.';
import { getUsers } from '@blockframes/firebase-utils';

/**
 * Simple Hello World cy.task()
 * @param message message to log to console
 */
export function log(message: any) {
  typeof message === 'string' ? console.log(message) : console.dir(message);
  return message;
}

export function getTestUsers() {
  return getUsers(db);
}
