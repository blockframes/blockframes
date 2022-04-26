import { Organization, App } from '@blockframes/model';

export function canHavePreferences(org: Organization, app: App) {
  if (app !== 'catalog' && app !== 'festival') return;
  const { marketplace, dashboard } = org.appAccess[app];
  return marketplace && !dashboard;
}