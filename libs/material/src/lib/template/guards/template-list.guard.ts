import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StateListGuard, FireQuery, Query } from '@blockframes/utils';
import { Template, TemplateStore } from '../+state';
import { OrganizationQuery } from '@blockframes/organization';
import { switchMap } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

const templateQuery = (id: string): Query<Template> => ({
  path: `templates/${id}`
});

@Injectable({ providedIn: 'root' })
export class TemplateListGuard extends StateListGuard<Template> {
  urlFallback = '/layout/o/templates/create';

  constructor(
    private fireQuery: FireQuery,
    private organizationQuery: OrganizationQuery,
    store: TemplateStore,
    router: Router
  ) {
    super(store, router);
  }

  get query() {
    return this.organizationQuery
      .select(state => state.org.templateIds)
      .pipe(
        switchMap(ids => {
          if (!ids || ids.length === 0) throw new Error('No template yet')
          const queries = ids.map(id => this.fireQuery.fromQuery<Template>(templateQuery(id)))
          return combineLatest(queries)
        })
      );
  }
}
