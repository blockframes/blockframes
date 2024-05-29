import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';

import { LandingComponent } from './landing.component';
import { LandingShellModule } from '@blockframes/landing/shell/shell.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';



@NgModule({
  declarations: [LandingComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    LandingShellModule,
    ReactiveFormsModule,
    ImageModule,
    AppLogoModule,

    // Material
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    RouterModule.forChild([{ path: '', component: LandingComponent }])
  ]
})
export class FinanciersLandingModule { }
