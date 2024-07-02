import { Injectable, Optional } from '@angular/core';
import { Intercom, IntercomBootInput } from '@supy-io/ngx-intercom';
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

export function getIntercomOptions(user?: User): IntercomBootInput {
  const options = { custom_launcher_selector: '#intercom' };
  if (user) {
    const { email, uid, firstName } = user;
    return { email, ...options, user_id: uid, name: firstName };
  }
  return options;
}
