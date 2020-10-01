import { Injectable } from '@angular/core';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { Intercom } from 'ng-intercom';
import { User } from '@blockframes/user/types';

@Injectable({ providedIn: 'root' })
export class IntercomService {

  constructor(
    private query: AuthQuery,
    public ngIntercom: Intercom
  ) {}

  enable() {
    const user = this.query.user;
    this.ngIntercom.boot(getIntercomOptions(user));
  }

  disable() {
    this.ngIntercom.shutdown();
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
