import { Injectable } from '@angular/core';
import { CollectionGuard } from 'akita-ng-fire';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { map } from 'rxjs/operators';
import { TemplateState } from '../+state/template.store';
import { TemplateService } from '../+state/template.service';
import { TemplateQuery } from '../+state/template.query';
import { resolvePath } from '@blockframes/utils/routes';

@Injectable({ providedIn: 'root' })
export class TemplateListGuard extends CollectionGuard<TemplateState> {
  constructor(protected service: TemplateService, private query: TemplateQuery) {
    super(service);
  }

  get awaitSync() {
    return this.query.getCount() === 0;
  }

  sync(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.service.syncOrgTemplates().pipe(
      map(_ => this.query.getCount()),
      map(count => (count === 0 ? resolvePath(state.url, '../create') : true))
    );
  }
}
