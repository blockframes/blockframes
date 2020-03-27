import { Injectable } from "@angular/core";
import { CollectionGuard, CollectionGuardConfig } from "akita-ng-fire";
import { EventState } from "../+state/event.store";
import { EventService } from "../+state/event.service";
import { ActivatedRouteSnapshot } from "@angular/router";
import { map } from "rxjs/operators";

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class EventActiveGuard extends CollectionGuard<EventState> {

  constructor(service: EventService) {
    super(service);
  }

  // Sync and set active
  sync(next: ActivatedRouteSnapshot) {
    return this.service.syncActive({ id: next.params.eventId }).pipe(
      map(event =>  event ? true : (this.redirect || next.data.redirect))
    )
  }
}
