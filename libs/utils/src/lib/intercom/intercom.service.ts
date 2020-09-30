import { Injectable } from '@angular/core';
import { GDPRService } from '../gdpr-cookie/gdpr-service/gdpr-service';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { Intercom } from 'ng-intercom';
import { intercomId } from '@env';
import { distinctUntilChanged } from 'rxjs/operators';
import { User } from '@blockframes/user/types';

@Injectable({ providedIn: 'root' })
export class IntercomService extends GDPRService {

  constructor(
    private query: AuthQuery,
    public intercom: Intercom
    ) {
    super('c8-gdpr-intercom');
    if (intercomId) {
      query.user$.pipe(
        distinctUntilChanged((oldUser, newUser) => !!oldUser === !!newUser) // Trigger only when the user login/logout
        ).subscribe(user => {
          intercom.shutdown();  // Stop listening to the current session

          const intercomCookieAccepted = localStorage.getItem('c8-gdpr-intercom')
          if (intercomCookieAccepted === 'true') {
            intercom.boot(this.getIntercomOptions(user));
          }
        }
      )
    }
  }

  enable() {
    const user = this.query.user;
    this.intercom.boot(this.getIntercomOptions(user));
  }

  disable() {
    this.intercom.shutdown();
  }

  private getIntercomOptions(user: User) {
    return user
    ?  {
          email: user.email,
          user_id: user.uid,
          name: user.firstName,
          widget: {
            "activator": "#intercom"
          }
        }
    :  {
          widget: {
            "activator": "#intercom"
          }
        };
  }
}
