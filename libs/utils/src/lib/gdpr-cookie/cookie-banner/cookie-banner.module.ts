
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';

// Component
import { CookieBannerComponent } from './cookie-banner.component';
import { CookieDialogModule } from '../cookie-dialog/cookie-dialog.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [CookieBannerComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    ImageModule,
    
    // Material
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatIconModule,
    CookieDialogModule
  ],
  exports: [CookieBannerComponent]
})
export class CookieBannerModule { }
