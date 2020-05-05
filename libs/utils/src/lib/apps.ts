/**
 * Apps definition
 */

import { RouterQuery } from "@datorama/akita-ng-router-store";

export const app = ['catalog', 'festival'] as const;
export type App = typeof app[number];

export const module = ['dashboard', 'marketplace'] as const;
export type Module = typeof module[number];

const appName = {
  catalog: 'Archipel Content',
  festival: 'Festival'
};

export type ModuleAccess = Record<Module, boolean>;
export type OrgAppAccess = Record<App, ModuleAccess>;
export type MovieAppAccess = Record<App, boolean>;

export function getCurrentApp(routerQuery: RouterQuery): App {
  return routerQuery.getValue().state?.root.data.app;
}

export function createOrgAppAccess(_appAccess: Partial<OrgAppAccess> = {}): OrgAppAccess {
  const appAccess = {} as OrgAppAccess;
  for (const a of app) {
    appAccess[a] = createModuleAccess(_appAccess[a] ? _appAccess[a] : {});
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

export function createModuleAccess(moduleAccess: Partial<ModuleAccess> = {}): ModuleAccess {
  return {
    dashboard: false,
    marketplace: false,
    ...moduleAccess
  }
}

export function getAppName(slug: App) {
  return { slug, label: appName[slug] };
}