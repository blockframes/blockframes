import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { LandingComponent } from './landing.component';
import { LandingModule } from '@blockframes/landing/landing.module';

// Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
  declarations: [LandingComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    LandingModule,
    // Material
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: LandingComponent }])
  ]
})
export class FestivalLandingModule { }
