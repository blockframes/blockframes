import * as tasks from './tasks';
import type * as foo from 'cypress';

/**
 * This function will return an object of Cypress tasks, after
 * processing the current testing env from `config`.
 * @param config the Cypress plugin file config object
 */
export function getCypressTasks(config: Cypress.PluginConfigOptions): Cypress.Tasks {
  // * Use this function to set up environment for tasks in future
  // * For example, you can read env config from `config` and do a setup here
  return tasks;
}
