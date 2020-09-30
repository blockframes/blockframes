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
    public intercomService: Intercom
  ) {
    if (intercomId) {
      query.user$.pipe(
        distinctUntilChanged((oldUser, newUser) => !!oldUser === !!newUser) // Trigger only when the user login/logout
        ).subscribe(user => {
          intercomService.shutdown();  // Stop listening to the current session

          const { intercom } = this.gdpr.cookieConsent;
          if (intercom) {
            intercomService.boot(this.getIntercomOptions(user));
          }
        }
      )
    }
  }

  enable() {
    const user = this.query.user;
    this.intercomService.boot(this.getIntercomOptions(user));
  }

  disable() {
    this.intercomService.shutdown();
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
