import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { MaterialState, MaterialStore } from '../+state/material.store';
import { MaterialService } from '../+state/material.service';
import { ActivatedRouteSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class TemplateMaterialsGuard extends CollectionGuard<MaterialState> {
  constructor(service: MaterialService, protected store: MaterialStore) {
    super(service);
  }

  sync(next: ActivatedRouteSnapshot) {
    return this.service.syncCollection(`templates/${next.params.templateId}/materials`);
  }
}
