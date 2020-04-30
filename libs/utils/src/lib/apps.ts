/**
 * Apps definition
 */

import { RouterQuery } from "@datorama/akita-ng-router-store";

export const app = ['catalog', 'festival'] as const;
export type App = typeof app[number];

export interface InnerAppAccess { marketplace: boolean, dashboard: boolean };
export type OrgAppAccess = Record<App, InnerAppAccess>;
export type MovieAppAccess = Record<App, boolean>;

/** @TODO (#2539) This is currently unused but we keep it to future uses. */
/*export interface AppDetails {
  name: string;
  logo: string;
  href: string;
  id: App;
}*/

export function getCurrentApp(routerQuery: RouterQuery): App {
  return routerQuery.getValue().state.root.data?.app as App;
}

export function createOrgAppAccess(_appAccess: Partial<OrgAppAccess> = {}): OrgAppAccess {
  let appAccess = {};
  for (const a of app) {
    appAccess[a] = createInnerAppAccess(_appAccess[a] ? _appAccess[a] : {});
  }
  return appAccess as OrgAppAccess
}

export function createMovieAppAccess(_appAccess: Partial<MovieAppAccess> = {}): MovieAppAccess {
  let appAccess = {};
  for (const a of app) {
    appAccess[a] = _appAccess[a] ? _appAccess[a] : false;
  }
  return appAccess as MovieAppAccess
}

export function createInnerAppAccess(innerAppAccess: Partial<InnerAppAccess> = {}): InnerAppAccess {
  return {
    dashboard: false,
    marketplace: false,
    ...innerAppAccess
  }
}