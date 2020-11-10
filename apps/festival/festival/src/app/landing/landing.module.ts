import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { LandingComponent } from './landing.component';
import { LandingShellModule } from '@blockframes/landing/shell/shell.module';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  declarations: [LandingComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    LandingShellModule,
    ReactiveFormsModule,
    ImageReferenceModule,
    AppLogoModule,

    // Material
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    RouterModule.forChild([{ path: '', component: LandingComponent }])
  ]
})
export class FestivalLandingModule { }
