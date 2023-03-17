import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { LandingComponent } from './landing.component';
import { LandingShellModule } from '@blockframes/landing/shell/shell.module';

@NgModule({
  declarations: [LandingComponent],
  imports: [
    CommonModule,
    LandingShellModule,
    RouterModule.forChild([{ path: '', component: LandingComponent }])
  ]
})
export class WaterfallLandingModule { }
