/**
 * Apps definition
 */
import { OrganizationBase, OrganizationDocument } from "@blockframes/organization/+state/organization.firestore";
import { StoreStatus } from "./static-model";
import { EmailJSON } from '@sendgrid/helpers/classes/email-address';
import { appUrl } from "@env";
import { MovieBase, MovieDocument } from '@blockframes/data-model';

export interface AppMailSetting {
  description: string,
  logo: AppLogoValue,
  name: AppNameValue,
  url?: string,
}

export const app = ['catalog', 'festival', 'financiers', 'crm'] as const;
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
type AppNameValue = typeof appName[App];

export const appShortName = {
  catalog: 'AC',
  festival: 'AM',
  financiers: 'MF',
  blockframes: 'BF',
  crm: 'CRM',
  cms: 'CMS'
};

export const sendgridEmailsFrom: Record<App | 'default', EmailJSON> = {
  catalog: { email: 'team@archipelcontent.com', name: 'Archipel Content' },
  festival: { email: 'team@archipelmarket.com', name: 'Archipel Market' },
  financiers: { email: 'team@mediafinanciers.com', name: 'Media Financiers' },
  crm: { email: 'team@cascade8.com', name: 'Cascade 8' },
  default: { email: 'team@cascade8.com', name: 'Cascade 8' }
} as const;

// Those logos have to be in PNG because Gmail doesn't support SVG images
export const appLogo = {
  catalog: `${appUrl.content}/assets/email/archipel-content.png`,
  festival: `${appUrl.market}/assets/email/archipel-market.png`,
  financiers: `${appUrl.financiers}/assets/email/media-financiers.png`,
  crm: ''
};
type AppLogoValue = typeof appLogo[App];

export const appDescription = {
  catalog: 'Archipel Content is an ongoing digital marketplace for TV, VOD and ancillary rights. Let’s make content buying simple : One massive library, One package offer, One negotiation, One contract.',
  festival: 'Archipel Market is an ongoing film market platform, one tool for your year-round promotion and acquisitions.',
  financiers: 'Media Financiers enables private investors to co-produce exclusive films and TV series on the same conditions as top professional content financiers.',
};

export type ModuleAccess = Record<Module, boolean>;
export type OrgAppAccess = Record<App, ModuleAccess>;

export const applicationUrl: Record<App, string> = {
  festival: appUrl.market,
  catalog: appUrl.content,
  financiers: appUrl.financiers,
  crm: appUrl.crm
}

/** Return an array of app without the value passing in argument */
export function getAllAppsExcept(applications: App[]) {
  return app.filter(a => !applications.includes(a));
}

export function createOrgAppAccess(_appAccess: Partial<OrgAppAccess> = {}): OrgAppAccess {
  const appAccess = {} as OrgAppAccess;
  for (const a of app) {
    appAccess[a] = createModuleAccess(_appAccess[a]);
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

/**
 * Returns the apps that the org have access to
 * @param org The org to query
 * @param first The app name to return first (if present)
 * @example
 * getOrgAppAccess(orgA); // ['catalog', 'festival']
 * getOrgAppAccess(orgA, 'festival'); // ['festival', 'catalog']
 */
export function getOrgAppAccess(org: OrganizationDocument | OrganizationBase<Date>, first: App = 'festival'): App[] {
  const apps: App[] = [];
  for (const a of app) {
    const hasAccess = modules.some(m => !!org.appAccess[a]?.[m]);
    if (hasAccess) {
      apps.push(a);
    }
  }

  // If org have access to several app, including "first",
  // we put it in first place of the response array
  if (apps.length > 1 && apps.includes(first)) {
    return [first, ...apps.filter(a => a !== first)];
  } else {
    return apps;
  }
}

/** Return an array of the app access of the movie */
export function getMovieAppAccess(movie: MovieDocument | MovieBase<Date>): App[] {
  return app.filter(a => !['crm'].includes(a) && movie.app[a].access);
}

/** Return true if the movie has the status passed in parameter for at least one application */
export function checkMovieStatus(movie: MovieDocument | MovieBase<Date>, status: StoreStatus) {
  return (Object.keys(movie.app).some(a => movie.app[a].status === status))
}

/**
 * Returns the modules an org have access to for a particular app or for all apps
 * @param org
 * @param a
 * @example
 * // we don't know in which app the module is
 * getOrgModuleAccess(orgA); // ['dashboard', 'marketplace']
 * getOrgModuleAccess(orgB); // ['marketplace']
 */
export function getOrgModuleAccess(org: OrganizationDocument | OrganizationBase<Date>, _a?: App): Module[] {
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
export function getMailSender(a?: App): EmailJSON {
  if (!a) {
    return sendgridEmailsFrom.default;
  } else {
    return sendgridEmailsFrom[a] || sendgridEmailsFrom.default;
  }
}
