/**
 * Apps definition
 */
import { OrganizationDocument } from "@blockframes/organization/+state/organization.firestore";
import { StoreStatus } from "@blockframes/movie/+state/movie.firestore";

export const app = ['catalog', 'festival'] as const;
export type App = typeof app[number];

export const module = ['dashboard', 'marketplace'] as const;
export type Module = typeof module[number];

const appName = {
  catalog: 'Archipel Content',
  festival: 'Festival'
};

export const sendgridEmailsFrom = {
  catalog: 'team@archipelcontent.com',
  festival: 'team@archipelmarket.com',
  default: 'admin@blockframes.io'
} as const;

export type ModuleAccess = Record<Module, boolean>;
export type OrgAppAccess = Record<App, ModuleAccess>;
export type MovieAppAccess = Record<App, boolean>;

export function getCurrentApp(routerQuery: any): App {
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

/**
 * Returns the apps that the org have access to
 * @param org 
 */
export function getOrgAppAccess(org: OrganizationDocument): App[] {
  const allowedApps = {} as Record<App, boolean>;
  for (const a of app) {
    for (const m of module) {
      if (org.appAccess[a][m]) {
        allowedApps[a] = true;
      }
    }
  }

  return Object.keys(allowedApps).map(k => k as App);
}

/**
 * Determine the status to update depending on the current app.
 * For app Festival, publish status is "accepted", "submittted" for other apps
 */
export function getMoviePublishStatus(a: App): StoreStatus {
  return a === 'festival' ? 'accepted' : 'submitted';
}

/**
 * Returns the "from" email that should be used depending on the current app
 * @param app 
 */
export function getSendgridFrom(app?: App): string {
  if (!app) {
    return sendgridEmailsFrom.default;
  } else {
    return sendgridEmailsFrom[app] || sendgridEmailsFrom.default;
  }
}