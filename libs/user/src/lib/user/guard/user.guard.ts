import { Injectable } from '@angular/core';
import { CollectionGuardConfig, CollectionGuard } from 'akita-ng-fire';
import { UserState } from '../+state/user.store';
import { UserService } from '../+state/user.service';
import { switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class UserGuard extends CollectionGuard<UserState> {
  constructor(protected service: UserService) {
    super(service);
  }

  sync() {
    return this.service.userIds$.pipe(
      switchMap(userIds => this.service.syncManyDocs(userIds))
    );
  }
}
