import { Injectable, NgModule } from '@angular/core';
import { AuthQuery, User } from '@blockframes/auth';
import { Intercom, IntercomModule } from 'ng-intercom';
import { intercomId } from '@env';
import { Observable, Subscription } from 'rxjs';

@Injectable()
export class IntercomInitialize {

  private user$: Observable<User>;
  private sub: Subscription;
  private intercom: Intercom

  constructor(private query: AuthQuery) {
    this.user$ = this.query.user$;

    if (intercomId) {
      this.sub = this.user$.subscribe(user => {
      if (!!user) {
        // Initialize Intercom Messenger for logged user
        this.intercom.boot({
          email: user.email,
          user_id: user.uid,
          name: user.surname,
          widget: {
            "activator": "#intercom"
          }
        });
      } else {
        // Initialize Intercom for visitor
        this.intercom.boot({
          widget: {
            "activator": "#intercom"
          }
        });
      }
    });
    } else {
      this.intercom.shutdown();
    }
  }
}

@NgModule({
  imports: [
    IntercomModule.forRoot({
      appId: intercomId,
      updateOnRouterChange: true // will automatically run `update` on router event changes. Default: `false`
    })
  ],
  declarations: [],
  exports: []
})
export class IntercomAppModule {}
