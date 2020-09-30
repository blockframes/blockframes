import { NgModule } from '@angular/core';
import { IntercomModule } from 'ng-intercom';
import { intercomId } from '@env';

@NgModule({
  imports: [
    IntercomModule.forRoot({ appId: intercomId })
  ],
})
export class IntercomAppModule {}
