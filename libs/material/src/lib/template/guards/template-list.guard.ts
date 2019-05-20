import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StateListGuard, FireQuery, Query } from '@blockframes/utils';
import { Template, TemplateStore } from '../+state';
import { OrganizationQuery } from '@blockframes/organization';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

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

  get query(): Observable<Template[]> {
    return this.orgQuery.selectAll().pipe(
      switchMap(orgs => {
        const templates$ = orgs.map(org => {
          const query = templateListQuery(org.id);
          return this.fireQuery.fromQuery<Template[]>(query);
        });
        return [].concat(templates$);
      })
    )
  }
}
