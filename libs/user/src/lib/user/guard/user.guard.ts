import { Injectable } from '@angular/core';
import { CollectionGuardConfig, CollectionGuard } from 'akita-ng-fire';
import { UserState } from '../+state/user.store';
import { UserService } from '../+state/user.service';
import { switchMap } from 'rxjs/operators';
import { OrganizationService } from '@blockframes/organization/+state';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class UserGuard extends CollectionGuard<UserState> {
  constructor(protected service: UserService, private orgService: OrganizationService) {
    super(service);
  }

  sync() {
    return this.orgService.userIds$.pipe( // @TOTO #7284 #7273 maybe this can be removed on orgService ?
      switchMap(userIds => this.service.syncManyDocs(userIds))
    );
  }
}
