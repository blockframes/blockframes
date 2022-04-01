import { Organization } from '@blockframes/shared/model';
import { App } from '@blockframes/utils/apps';

export function canHavePreferences(org: Organization, app: App) {
  if (app !== 'catalog' && app !== 'festival') return;
  const { marketplace, dashboard } = org.appAccess[app];
  return marketplace && !dashboard;
}