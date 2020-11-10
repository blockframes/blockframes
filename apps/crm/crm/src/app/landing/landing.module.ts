import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Modules
import { LandingShellModule } from '@blockframes/landing/shell/shell.module';

// Components
import { LandingComponent } from './pages/landing-page/landing-page.component';

@NgModule({
  declarations: [LandingComponent],
  imports: [
    CommonModule,
    LandingShellModule,
    RouterModule.forChild([{ path: '', component: LandingComponent }])
  ]
})
export class CrmLandingModule { }
