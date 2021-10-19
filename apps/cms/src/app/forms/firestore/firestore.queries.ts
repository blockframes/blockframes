// Prebuilt queries for titles form
import { LimitQuery, OrderByQuery, StartAtQuery, WhereQuery } from '@blockframes/admin/cms';
import { App } from '@blockframes/utils/apps';

export function titlesFromApp(app: App): WhereQuery[] {
  return [{
    method: 'where',
    field: `app.${app}.access`,
    condition: '==',
    value: true
  }, {
    method: 'where',
    field: `app.${app}.status`,
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

export function events(): (WhereQuery | OrderByQuery | StartAtQuery)[] {
  return [{
    method: 'where',
    field: 'type',
    condition: '==',
    value: 'screening'
  }, {
    method: 'where',
    field: 'isSecret',
    condition: '==',
    value: false
  }, {
    method: 'orderBy',
    field: 'end',
    direction: 'asc'
  }, {
    method: 'startAt',
    value: 'runningAndUpcomingEvents'
  }];
}

export function limit(amount: number): LimitQuery {
  return { method: 'limit', limit: amount };
}
