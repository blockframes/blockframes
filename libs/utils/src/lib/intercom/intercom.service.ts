import { Injectable, Optional } from '@angular/core';
import { Intercom } from 'ng-intercom';
import { User } from '@blockframes/user/types';
import { AuthService } from '@blockframes/auth/+state';

@Injectable({ providedIn: 'root' })
export class IntercomService {

  constructor(
    private authService: AuthService,
    @Optional() public ngIntercom?: Intercom
  ) {}

  enable() {
    const user = this.authService.profile;
    this.ngIntercom?.boot(getIntercomOptions(user));
  }

  disable() {
    this.ngIntercom?.shutdown();
  }
}

export function getIntercomOptions(user?: User) {
  const widget = { activator: '#intercom' }
  if (user) {
    const { email, uid, firstName } = user;
    return { email, widget, user_id: uid, name: firstName }
  }
  return widget;
}
