import { Injectable } from '@angular/core';
import { CollectionGuard } from 'akita-ng-fire';
import { MaterialState, MaterialStore } from '../+state/material.store';
import { MaterialService } from '../+state/material.service';
import { ActivatedRouteSnapshot } from '@angular/router';
import { MaterialQuery } from '../+state/material.query';

@Injectable({ providedIn: 'root' })
export class TemplateMaterialsGuard extends CollectionGuard<MaterialState> {
  constructor(service: MaterialService, private store: MaterialStore, private query: MaterialQuery) {
    super(service);
  }

  get awaitSync() {
    return this.query.getCount() === 0;
  }

  sync(next: ActivatedRouteSnapshot) {
    this.store.reset();
    return this.service.syncCollection(`templates/${next.params.templateId}/materials`);
  }
}
