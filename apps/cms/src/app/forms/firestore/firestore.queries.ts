// Prebuilt queries for titles form
import { LimitQuery, WhereQuery } from './firestore.schema';
import { App } from '@blockframes/utils/apps';

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
    value: 'accepted'
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

export function orgsFromApp(app: App): WhereQuery[] {
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

export function limit(amount: number): LimitQuery {
  return { method: 'limit', limit: amount };
}