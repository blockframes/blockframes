import { Injectable } from '@angular/core';
import { GDPRService } from '../gdpr-cookie/gdpr-service/gdpr-service';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { Intercom } from 'ng-intercom';
import { intercomId } from '@env';
import { distinctUntilChanged } from 'rxjs/operators';
import { User } from '@blockframes/user/types';

@Injectable({ providedIn: 'root' })
export class IntercomService {

  constructor(
    private query: AuthQuery,
    public gdpr: GDPRService,
    public ngIntercom: Intercom
  ) {
    if (intercomId) {
      query.user$.pipe(
        distinctUntilChanged((oldUser, newUser) => !!oldUser === !!newUser) // Trigger only when the user login/logout
        ).subscribe(user => {
          ngIntercom.shutdown();  // Stop listening to the current session

          const { intercom } = this.gdpr.cookieConsent;
          if (intercom) {
            ngIntercom.boot(this.getIntercomOptions(user));
          }
        }
      )
    }
  }

  enable() {
    const user = this.query.user;
    this.ngIntercom.boot(this.getIntercomOptions(user));
  }

  disable() {
    this.ngIntercom.shutdown();
  }

  private getIntercomOptions(user: User) {
    const widget = { activator: '#intercom' }
    if (user) {
      const { email, uid, firstName } = user;
      return { email, widget, user_id: uid, name: firstName }
    }
    return widget;
  }
}
