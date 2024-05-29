
// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Components
import {
  LandingShellComponent,
  LandingHeaderDirective,
  LandingContentDirective,
  LandingContactDirective,
  LandingDetailDirective,
  LandingAppLinkDirective,
  LandingFooterComponent
} from './shell.component';

// Blockframes
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';
import { TelInputModule } from '@blockframes/ui/tel-input/tel-input.module'
import { RolePipeModule } from '@blockframes/utils/pipes/role.pipe';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    AppLogoModule,
    RolePipeModule,
    TelInputModule,
    ImageModule,

    // Material
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatCheckboxModule,
    MatDividerModule
  ],
  exports: [
    LandingShellComponent,
    LandingHeaderDirective,
    LandingContentDirective,
    LandingContactDirective,
    LandingDetailDirective,
    LandingAppLinkDirective,
    LandingFooterComponent],
  declarations: [
    LandingShellComponent,
    LandingHeaderDirective,
    LandingContentDirective,
    LandingContactDirective,
    LandingDetailDirective,
    LandingAppLinkDirective,
    LandingFooterComponent
  ],
})
export class LandingShellModule { }
