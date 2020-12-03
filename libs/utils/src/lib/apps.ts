/**
 * Apps definition
 */
import { OrganizationDocument, OrganizationDocumentWithDates } from "@blockframes/organization/+state/organization.firestore";
import { StoreStatus } from "./static-model";
import { EmailJSON } from '@sendgrid/helpers/classes/email-address';
import { appUrl } from "@env";

export interface AppMailSetting {
  name: AppNameValue,
  logo: AppLogoValue,
  url?: string,
}

export const app = ['catalog', 'festival', 'financiers'] as const;
export type App = typeof app[number];

export const modules = ['dashboard', 'marketplace'] as const;
export type Module = typeof modules[number];

export const appName = {
  catalog: 'Archipel Content',
  festival: 'Archipel Market',
  financiers: 'Media Financiers',
  blockframes: 'Blockframes',
  crm: 'Blockframes CRM',
  cms: 'Blockframes CMS'
};
export type AppName = keyof typeof appName;
export type AppNameValue = typeof appName[AppName];

export const sendgridEmailsFrom: Record<App | 'default', EmailJSON> = {
  catalog: { email: 'team@archipelcontent.com', name: 'Archipel Content' },
  festival: { email: 'team@archipelmarket.com', name: 'Archipel Market' },
  financiers: { email: 'team@mediafinanciers.com', name: 'Media Financiers' },
  default: { email: 'team@cascade8.com', name: 'Cascade 8' }
} as const;

// TODO use base64 picture to send logo of the app
export const appLogo = {
  catalog: 'https://www.galaxietransmedia.fr/wp-content/uploads/2018/05/lezard-9.jpg',
  festival: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5QjCbyuweMF7M8hwXgIuuzCnBCAI7oxmyIA&usqp=CAU',
  financiers: 'https://www.nationalgeographic.com/content/dam/animals/pictures/hero/reptiles-hero.adapt.1900.1.jpg',
};
export type AppLogo = keyof typeof appLogo;
export type AppLogoValue = typeof appLogo[AppLogo];

export type ModuleAccess = Record<Module, boolean>;
export type OrgAppAccess = Record<App, ModuleAccess>;
export type MovieAppAccess = Record<App, boolean>;

export const applicationUrl: Record<App, string> = {
  festival: appUrl.market,
  catalog: appUrl.content,
  financiers: appUrl.financiers
}

export function getCurrentApp(routerQuery: any): App {
  return routerQuery.getValue().state?.root.data.app;
}

export function getCurrentModule(path: string): Module | 'landing' {
  const fragments = path.split('/');
  if (fragments.includes('marketplace')) {
    return 'marketplace'
  } else if (fragments.includes('dashboard')) {
    return 'dashboard';
  } else {
    return 'landing';
  }
}

export function createOrgAppAccess(_appAccess: Partial<OrgAppAccess> = {}): OrgAppAccess {
  const appAccess = {} as OrgAppAccess;
  for (const a of app) {
    appAccess[a] = createModuleAccess(_appAccess[a]);
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

export function getAppLogo(slug: App) {
  return appLogo[slug];
}

/**
 * Returns the apps that the org have access to
 * @param org
 * @param first
 * @example
 * getOrgAppAccess(orgA); // ['catalog', 'festival']
 * getOrgAppAccess(orgB); // ['festival']
 */
export function getOrgAppAccess(org: OrganizationDocument | OrganizationDocumentWithDates, first: App = 'festival'): App[] {
  const apps: App[] = [];
  for (const a of app) {
    const hasAccess = modules.some(m => !!org.appAccess[a]?.[m]);
    if (hasAccess) {
      apps.push(a);
    }
  }

  // If org have access to several app, including "first",
  // we put it in first place of the response array
  // @TODO (#2848)
  if (apps.length > 1 && apps.includes(first)) {
    return [first, ...apps.filter(a => a !== first)];
  } else {
    return apps;
  }
}

/**
 * Returns the modules an org have access to for a particular app or for all apps
 * @param org
 * @param a
 * @example
 * // we don't know in witch app the module is
 * getOrgModuleAccess(orgA); // ['dashboard', 'marketplace']
 * getOrgModuleAccess(orgB); // ['marketplace']
 */
export function getOrgModuleAccess(org: OrganizationDocument | OrganizationDocumentWithDates, _a?: App): Module[] {
  const allowedModules = {} as Record<Module, boolean>;

  if (_a) {
    for (const m of modules) {
      if (org.appAccess[_a]?.[m]) {
        allowedModules[m] = true;
      }
    }
  } else {
    for (const a of app) {
      for (const m of modules) {
        if (org.appAccess[a]?.[m]) {
          allowedModules[m] = true;
        }
      }
    }
  }
  return Object.keys(allowedModules).map(k => k as Module);
}

/**
 * Determine the status to update depending on the current app.
 * For app Festival, publish status is "accepted", "submitted" for other apps
 */
export function getMoviePublishStatus(a: App): StoreStatus {
  return a === 'festival' ? 'accepted' : 'submitted';
}

/**
 * Returns the "from" email that should be used depending on the current app
 * @param a
 */
export function getSendgridFrom(a?: App): EmailJSON {
  if (!a) {
    return sendgridEmailsFrom.default;
  } else {
    return sendgridEmailsFrom[a] || sendgridEmailsFrom.default;
  }
}
