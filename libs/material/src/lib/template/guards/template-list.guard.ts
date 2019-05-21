import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StateListGuard, FireQuery, Query } from '@blockframes/utils';
import { Template, TemplateStore } from '../+state';
import { OrganizationQuery } from '@blockframes/organization';
import { switchMap, map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { flatten } from 'lodash';

const templateListQuery = (orgId: string): Query<Template[]> => ({
  path: `templates`,
  queryFn: ref => ref.where('orgId', '==', orgId)
});

@Injectable({ providedIn: 'root' })
export class TemplateListGuard extends StateListGuard<Template> {
  urlFallback = 'layout';

  constructor(
    private fireQuery: FireQuery,
    private orgQuery: OrganizationQuery,
    store: TemplateStore,
    router: Router
  ) {
    super(store, router);
  }

  get query() {
    return this.orgQuery.selectAll().pipe(
      switchMap(orgs => {
        const templates$ = orgs.map(org => {
          const query = templateListQuery(org.id);
          return this.fireQuery.fromQuery<Template[]>(query);
        });
        return combineLatest(templates$)
      }),
      map(templates => flatten(templates))
    )
  }
}
