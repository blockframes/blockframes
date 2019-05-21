import { Injectable } from '@angular/core';
import { StateActiveGuard, FireQuery, Query } from '@blockframes/utils';
import { Template, TemplateStore } from '../+state';
import { Router } from '@angular/router';

export const templateActiveQuery = (templateId: string): Query<Template> => ({
  path: `templates/${templateId}`,
  materials: template => ({
    path: `templates/${template.id}/materials`
  })
});

@Injectable({ providedIn: 'root' })
export class TemplateActiveGuard extends StateActiveGuard<Template> {
  readonly params = ['templateId'];
  readonly urlFallback: 'layout';

  constructor(private fireQuery: FireQuery, store: TemplateStore, router: Router) {
    super(store, router);
  }

  query({ templateId }) {
    const query = templateActiveQuery(templateId);
    return this.fireQuery.fromQuery<Template>(query);
  }
}
