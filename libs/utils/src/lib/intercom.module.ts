import { NgModule } from '@angular/core';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { Intercom, IntercomModule } from 'ng-intercom';
import { intercomId } from '@env';

function getIntercomOptions(user) {
  return user
    ?  {
          email: user.email,
          user_id: user.uid,
          name: user.surname,
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

@NgModule({
  imports: [
    IntercomModule.forRoot({
      appId: intercomId,
      updateOnRouterChange: true // will automatically run `update` on router event changes. Default: `false`
    })
  ],
})
export class IntercomAppModule {

  constructor(
    query: AuthQuery,
    public intercom: Intercom,
    ) {
      if (intercomId) {
        query.user$.subscribe(user => {
          if (!user) {
            intercom.boot(getIntercomOptions(user))
          }
        })
      }
    }
  }

