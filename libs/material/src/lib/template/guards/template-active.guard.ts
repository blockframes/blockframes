import { Injectable } from "@angular/core";
import { CollectionGuard, CollectionGuardConfig } from "akita-ng-fire";
import { ActivatedRouteSnapshot } from "@angular/router";
import { TemplateState, TemplateService } from "../+state";

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class TemplateActiveGuard extends CollectionGuard<TemplateState> {

  constructor(service: TemplateService) {
    super(service);
  }

  // Sync and set active
  sync(next: ActivatedRouteSnapshot) {
    return this.service.syncActive({ id: next.params.templateId });
  }
}
