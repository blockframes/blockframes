import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StateListGuard, FireQuery, Query } from '@blockframes/utils';
import { Template, TemplateStore } from '../+state';
import { OrganizationQuery } from '@blockframes/organization';
import { switchMap } from 'rxjs/operators';

const templateQuery = (id: string): Query<Template> => ({
  path: `templates/${id}`
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
    return this.orgQuery
      .select(state => state.org.templateIds)
      .pipe(
        switchMap(ids => ids.map(id => this.fireQuery.fromQuery<Template[]>(templateQuery(id)))),
        switchMap(templates => templates)
      );
  }
}
