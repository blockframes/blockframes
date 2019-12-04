import { Injectable } from '@angular/core';
import { CollectionGuard } from 'akita-ng-fire';
import { MaterialState, MaterialStore } from '../+state/material.store';
import { MaterialQuery } from '../+state/material.query';
import { TemplateMaterialService } from '../+state/template-material.service';

@Injectable({ providedIn: 'root' })
export class TemplateMaterialsGuard extends CollectionGuard<MaterialState> {
  constructor(service: TemplateMaterialService, private store: MaterialStore, private query: MaterialQuery) {
    super(service);
  }

  get awaitSync() {
    return this.query.getCount() === 0;
  }

  sync() {
    this.store.reset();
    return this.service.syncCollection();
  }
}
