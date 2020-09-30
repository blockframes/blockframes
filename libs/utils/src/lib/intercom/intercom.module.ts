import { NgModule } from '@angular/core';
import { IntercomModule } from 'ng-intercom';
import { intercomId } from '@env';

@NgModule({
  imports: [
    IntercomModule.forRoot({
      appId: intercomId,
      updateOnRouterChange: true // will automatically run `update` on router event changes. Default: `false`
    })
  ],
})
export class IntercomAppModule {}
