import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StateListGuard, FireQuery, Query } from '@blockframes/utils';
import { MaterialStore, Material } from '../+state';
import { switchMap } from 'rxjs/operators';
import { OrganizationQuery } from '@blockframes/organization';

const templateMaterialsQuery = (templateId: string): Query<Material[]> => ({
  path: `templates/${templateId}/materials`
});

@Injectable({ providedIn: 'root' })
export class MovieMaterialsGuard extends StateListGuard<Material> {
  urlFallback = 'layout';

  constructor(
    private fireQuery: FireQuery,
    private organizationQuery: OrganizationQuery,
    store: MaterialStore,
    router: Router
  ) {
    super(store, router);
  }

  get query() {
    return this.organizationQuery.select('org').pipe(
      switchMap(organization => {
        return organization.templateIds.map(templateId => {
          const query = templateMaterialsQuery(templateId);
          return this.fireQuery.fromQuery<Material[]>(query);
        }
        )
      })
    );
  }
}
