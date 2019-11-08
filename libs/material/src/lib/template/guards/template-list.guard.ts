import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { map } from 'rxjs/operators';
import { TemplateState } from '../+state/template.store';
import { TemplateService } from '../+state/template.service';
import { TemplateQuery } from '../+state/template.query';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class TemplateListGuard extends CollectionGuard<TemplateState> {
  constructor(protected service: TemplateService, private query: TemplateQuery) {
    super(service);
  }

  sync() {
    return this.service.syncOrgTemplates().pipe(
      map(_ => this.query.getCount()),
      map(count => (count === 0 ? 'layout/o/templates/create' : true))
    );
  }
}
