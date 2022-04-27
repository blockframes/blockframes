import { app, App } from './static';

/** Return an array of app without the value passing in argument */
export function getAllAppsExcept(applications: App[]) {
  return app.filter((a) => !applications.includes(a));
}