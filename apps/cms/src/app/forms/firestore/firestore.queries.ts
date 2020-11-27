// Prebuilt queries for titles form
import { WhereQuery } from './firestore.schema';
import { App } from '@blockframes/utils/apps';

const titleApproval: Record<App, 'accepted' | 'submitted'> = {
  catalog: 'accepted',
  festival: 'submitted',
  financiers: 'accepted',
}

export function titlesFromApp(app: App): WhereQuery[] {
  return [{
    method: 'where',
    field: `storeConfig.appAccess.${app}`,
    condition: '==',
    value: true
  }, {
    method: 'where',
    field: `storeConfig.status`,
    condition: '==',
    value: titleApproval[app]
  }];
}

export function titlesFromOrg(orgId: string): WhereQuery[] {
  return [{
    method: 'where',
    field: 'orgIds',
    condition: 'array-contains',
    value: orgId
  }]
}

export function orgsFromApp(app: App) {
  return [{
    method: 'where',
    field: `appAccess.${app}.dashboard`,
    condition: '==',
    value: true
  }, {
    method: 'where',
    field: `status`,
    condition: '==',
    value: 'accepted'
  }];
}