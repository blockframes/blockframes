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
  return routerQuery.getValue().state?.root.data.app;
}

export function createOrgAppAccess(_appAccess: Partial<OrgAppAccess> = {}): OrgAppAccess {
  const appAccess = {} as OrgAppAccess;
  for (const a of app) {
    appAccess[a] = createInnerAppAccess(_appAccess[a] ? _appAccess[a] : {});
  }
  return appAccess;
}

export function createMovieAppAccess(_appAccess: Partial<MovieAppAccess> = {}): MovieAppAccess {
  const appAccess = {} as MovieAppAccess;
  for (const a of app) {
    appAccess[a] = _appAccess[a] === true;
  }
  return appAccess;
}

export function createInnerAppAccess(innerAppAccess: Partial<InnerAppAccess> = {}): InnerAppAccess {
  return {
    dashboard: false,
    marketplace: false,
    ...innerAppAccess
  }
}