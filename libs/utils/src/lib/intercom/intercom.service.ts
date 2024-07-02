import { Injectable, Optional } from '@angular/core';
import { Intercom } from '@supy-io/ngx-intercom';
import { User } from '@blockframes/model';

@Injectable({ providedIn: 'root' })
export class IntercomService {

  constructor(
    @Optional() public ngIntercom?: Intercom
  ) { }

  enable(user: User) {
    this.ngIntercom?.boot(getIntercomOptions(user));
  }

  disable() {
    this.ngIntercom?.shutdown();
  }
}

export function getIntercomOptions(user?: User) {
  const widget = { custom_launcher_selector: '#intercom' };
  if (user) {
    const { email, uid, firstName } = user;
    return { email, ...widget, user_id: uid, name: firstName };
  }
  return widget;
}
