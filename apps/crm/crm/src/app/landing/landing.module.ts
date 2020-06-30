import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Modules
import { LandingModule } from '@blockframes/landing/landing.module';

// Components
import { LandingComponent } from './pages/landing-page/landing-page.component';

@NgModule({
  declarations: [LandingComponent],
  imports: [
    CommonModule,
    LandingModule,
    RouterModule.forChild([{ path: '', component: LandingComponent }])
  ]
})
export class CrmLandingModule { }
