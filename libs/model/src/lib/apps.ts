import { AppLogoValue, } from '@blockframes/utils/apps';
import { app, App, AppNameValue } from './static';

export interface AppMailSetting {
  description: string;
  logo: AppLogoValue;
  name: AppNameValue;
  url?: string;
}

/** Return an array of app without the value passing in argument */
export function getAllAppsExcept(applications: App[]) {
  return app.filter((a) => !applications.includes(a));
}